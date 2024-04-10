const indexesData = [
    {
        index_name: 'dogs',
        full_name: 'Dogs',
        collection: 'dogs_d'
    },
    {
        index_name: 'breeds',
        full_name: 'Breeds',
        collection: 'breeds_d'
    },
    {
        index_name: 'owners',
        full_name: 'Owners',
        collection: 'owners_d'
    },
    {
        index_name: 'adoptions',
        full_name: 'Adoptions',
        collection: 'adoptions_d'
    }
];

try {
    const result = db.indexes.insertMany(indexesData);
    console.log('Indexes inserted successfully:', result.insertedCount);
} catch (error) {
    console.error('Error inserting indexes:', error);
}
