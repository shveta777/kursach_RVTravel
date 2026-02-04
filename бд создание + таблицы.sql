CREATE DATABASE RvTravelDB;
GO

USE RvTravelDB;
GO

-- 1. Users (Пользователи)
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100),
    Phone NVARCHAR(20),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT UQ_Users_Email UNIQUE (Email)
);

CREATE INDEX IX_Users_Email ON Users(Email);

-- 2. RVs (Дома на колёсах)
CREATE TABLE RVs (
    RvId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Brand NVARCHAR(100),
    Model NVARCHAR(100),
    Year INT,
    Length DECIMAL(5,2),
    Height DECIMAL(5,2),
    Width DECIMAL(5,2),
    Weight INT,
    FuelType NVARCHAR(20),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_RVs_Users FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE CASCADE
);

CREATE INDEX IX_RVs_UserId ON RVs(UserId);

-- 3. Routes (Маршруты)
CREATE TABLE Routes (
    RouteId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    IsPublic BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Routes_Users FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE CASCADE
);

CREATE INDEX IX_Routes_UserId ON Routes(UserId);
CREATE INDEX IX_Routes_IsPublic ON Routes(IsPublic) WHERE IsPublic = 1;

-- 4. RoutePoints (Точки маршрута)
CREATE TABLE RoutePoints (
    PointId INT IDENTITY(1,1) PRIMARY KEY,
    RouteId INT NOT NULL,
    Sequence INT NOT NULL,
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    Address NVARCHAR(500),
    IsStopover BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT FK_RoutePoints_Routes FOREIGN KEY (RouteId) 
        REFERENCES Routes(RouteId) ON DELETE CASCADE,
    CONSTRAINT UQ_RoutePoints_Sequence UNIQUE (RouteId, Sequence)
);

CREATE INDEX IX_RoutePoints_RouteId ON RoutePoints(RouteId);

-- 5. POIs (Интересные места)
CREATE TABLE POIs (
    PoiId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    Address NVARCHAR(500),
    Type NVARCHAR(50) NOT NULL,
    Phone NVARCHAR(20),
    Website NVARCHAR(500),
    AddedBy INT,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_POIs_Users FOREIGN KEY (AddedBy) 
        REFERENCES Users(UserId) ON DELETE SET NULL
);

CREATE INDEX IX_POIs_Type ON POIs(Type);
CREATE INDEX IX_POIs_Location ON POIs(Latitude, Longitude);
CREATE INDEX IX_POIs_AddedBy ON POIs(AddedBy);

-- 6. Reviews (Отзывы о POI)
CREATE TABLE Reviews (
    ReviewId INT IDENTITY(1,1) PRIMARY KEY,
    PoiId INT NOT NULL,
    UserId INT NOT NULL,
    Rating INT NOT NULL,
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT CHK_Reviews_Rating CHECK (Rating >= 1 AND Rating <= 5),
    CONSTRAINT FK_Reviews_POIs FOREIGN KEY (PoiId) 
        REFERENCES POIs(PoiId) ON DELETE CASCADE,
    CONSTRAINT FK_Reviews_Users FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT UQ_Reviews_UserPoi UNIQUE (PoiId, UserId)
);

CREATE INDEX IX_Reviews_PoiId ON Reviews(PoiId);
CREATE INDEX IX_Reviews_UserId ON Reviews(UserId);
CREATE INDEX IX_Reviews_CreatedAt ON Reviews(CreatedAt);