SET datestyle = "ISO, MDY";

\copy breeds(breed_id, breed_name, lifespan, country_of_origin) FROM '/root/data/breeds_d.csv' WITH (FORMAT CSV, HEADER);

\copy dogs(dog_id, dog_name, breed_id, color, weight, birth_date, adopted_date, acquired_date) FROM '/root/data/dogs_d.csv' WITH (FORMAT CSV, HEADER);

\copy owners(owner_id, owner_name, owner_surname, owner_phone, owner_email) FROM '/root/data/owners_d.csv' WITH (FORMAT CSV, HEADER);

\copy adoptions(adoption_id, owner_id, dog_id, adoption_date) FROM '/root/data/adoptions_d.csv' WITH (FORMAT CSV, HEADER);