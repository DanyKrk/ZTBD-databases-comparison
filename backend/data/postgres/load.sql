set datestyle = euro;

\copy breeds(breed_id, breed_name, lifespan, country_of_origin) FROM '/root/data/breeds_d.csv' WITH (FORMAT CSV, HEADER);

\copy dogs(dog_id, dog_name, breed_id, color, weight, birth_date, adopted_date, acquired_date) FROM '/root/data/dogs_d.csv' WITH (FORMAT CSV, HEADER);
