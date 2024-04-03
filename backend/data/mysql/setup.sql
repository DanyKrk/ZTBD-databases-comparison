-- CREATE DATABASE DOGS_DATABASE_MYSQL;
USE DOGS_DATABASE_MYSQL;

CREATE TABLE IF NOT EXISTS breeds (
    breed_id INT AUTO_INCREMENT PRIMARY KEY,
    breed_name VARCHAR(50),
    lifespan INT,
    country_of_origin VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS dogs (
    dog_id INT AUTO_INCREMENT PRIMARY KEY,
    dog_name VARCHAR(50),
    breed_id INT,
    color VARCHAR(50),
    weight FLOAT,
    birth_date DATE,
    adopted_date DATE,
    acquired_date DATE,
    FOREIGN KEY (breed_id) REFERENCES breeds(breed_id)
);
