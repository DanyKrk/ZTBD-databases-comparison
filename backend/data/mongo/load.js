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
    // TODO: add owners
];

try {
    const result = db.indexes.insertMany(indexesData);
    console.log('Indexes inserted successfully:', result.insertedCount);
} catch (error) {
    console.error('Error inserting indexes:', error);
}
