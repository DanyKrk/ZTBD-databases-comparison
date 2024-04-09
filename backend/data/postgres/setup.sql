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

CREATE TABLE IF NOT EXISTS owners (
    owner_id SERIAL PRIMARY KEY,
    owner_name VARCHAR(50),
    owner_surname VARCHAR(50),
    owner_phone VARCHAR(20),
    owner_email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS adoptions (
    adoption_id SERIAL PRIMARY KEY,
    owner_id INTEGER,
    dog_id INTEGER,
    adoption_date DATE,
    FOREIGN KEY (owner_id) REFERENCES owners (owner_id),
    FOREIGN KEY (dog_id) REFERENCES dogs (dog_id)
);

