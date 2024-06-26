
wait_for_redis() {
    echo "Waiting for Redis to start..."
    while ! redis-cli ping &>/dev/null; do
        echo "Retry in 10 seconds..."
        sleep 10
    done
    echo "Redis is online"
}

load_breeds_data() {
    while IFS=',' read -r breed_id breed_name lifespan country_of_origin; do
        country_of_origin=$(echo "$country_of_origin" | tr -d '\r')
        redis-cli HSET "breeds:$breed_id" breed_name "$breed_name" lifespan "$lifespan" country_of_origin "$country_of_origin"
    done < '/root/data/breeds_d.csv'
    echo "Breeds data loaded into Redis"
}


load_dogs_data() {
    while IFS=',' read -r dog_id dog_name breed_id color weight birth_date adopted_date acquired_date; do
        acquired_date=$(echo "$acquired_date" | tr -d '\r')
        redis-cli HMSET "dogs:$dog_id" dog_name "$dog_name" breed_id "$breed_id" color "$color" weight "$weight" birth_date "$birth_date" adopted_date "$adopted_date" acquired_date "$acquired_date"
    done < '/root/data/dogs_d.csv'
    echo "Dogs data loaded into Redis"
}

load_owners_data() {
    while IFS=',' read -r owner_id owner_name owner_surname owner_phone owner_email; do
        owner_email=$(echo "$owner_email" | tr -d '\r')
        redis-cli HMSET "owners:$owner_id" owner_name "$owner_name" owner_surname "$owner_surname" owner_phone "$owner_phone" owner_email "$owner_email"
    done < '/root/data/owners_d.csv'
    echo "Owners data loaded into Redis"
}

load_adoptions_data() {
    while IFS=',' read -r adoption_id owner_id dog_id adoption_date; do
        adoption_date=$(echo "$adoption_date" | tr -d '\r')
        redis-cli HMSET "adoptions:$adoption_id" owner_id "$owner_id" dog_id "$dog_id" adoption_date "$adoption_date"
    done < '/root/data/adoptions_d.csv'
    echo "Adoptions data loaded into Redis"
}

main() {
    wait_for_redis
    echo "Loading data into Redis..."
    load_breeds_data
    load_dogs_data
    load_owners_data
    load_adoptions_data
    echo "Data loading into Redis completed"
}

main
