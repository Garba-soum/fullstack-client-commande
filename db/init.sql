-- Créer la base si elle n'existe pas
IF DB_ID('appdb') IS NULL
BEGIN
    EXEC('CREATE DATABASE appdb');
END
GO

-- Utiliser la base
USE appdb;
GO

-- Créer la table users si elle n'existe pas
IF OBJECT_ID('users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL
    );
END
GO

-- Insérer l’admin si absent
IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
BEGIN
    INSERT INTO users (username, password, role)
    VALUES (
        'admin',
        '$2a$10$5.SDn0Eaew.rxY8t6VGwIuY0l9Ag.e2eqmMLDTNS6q692CdeCDQKa',
        'ADMIN'
    );
END
GO