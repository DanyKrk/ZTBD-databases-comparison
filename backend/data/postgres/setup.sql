CREATE TABLE breeds (
    breed_id SERIAL PRIMARY KEY,
    breed_name VARCHAR(50),
    lifespan INTEGER,
    country_of_origin VARCHAR(50)
);

CREATE TABLE if not exists dogs (
    dog_id SERIAL PRIMARY KEY,
    dog_name VARCHAR(50),
    breed_id INTEGER,
    color VARCHAR(50),
    weight FLOAT,
    birth_date DATE,
    adopted_date DATE,
    acquired_date DATE,
    FOREIGN KEY (breed_id) REFERENCES breeds (breed_id)
);