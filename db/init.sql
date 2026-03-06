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

-- Créer la table clients si elle n'existe pas
IF OBJECT_ID('clients', 'U') IS NULL
BEGIN
    CREATE TABLE clients (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        nom NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        telephone NVARCHAR(50) NOT NULL
    );
END
GO

-- Créer la table commandes si elle n'existe pas
IF OBJECT_ID('commandes', 'U') IS NULL
BEGIN
    CREATE TABLE commandes (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        produit NVARCHAR(255) NOT NULL,
        quantite INT NOT NULL,
        prix DECIMAL(18,2) NOT NULL,
        client_id BIGINT NOT NULL,
        CONSTRAINT FK_commandes_clients FOREIGN KEY (client_id) REFERENCES clients(id)
    );
END
GO

-- Créer ou mettre à jour l'utilisateur admin
IF EXISTS (SELECT 1 FROM users WHERE username = 'admin')
BEGIN
    UPDATE users
    SET password = '$2a$10$cF/mWP0Nzh7RVWOmf5L4Tub.3JSSW6czxI/Y6.csrvUZRQUajejJG',
        role = 'ADMIN'
    WHERE username = 'admin';
END
ELSE
BEGIN
    INSERT INTO users (username, password, role)
    VALUES (
        'admin',
        '$2a$10$cF/mWP0Nzh7RVWOmf5L4Tub.3JSSW6czxI/Y6.csrvUZRQUajejJG',
        'ADMIN'
    );
END
GO

-- Vérification
SELECT id, username, role, password
FROM users;
GO