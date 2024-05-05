// ייבוא המודולים הדרושים
const fs = require('fs');  // מודול לטיפול בקבצים
const csv = require('csv-parser');  // מודול לפרסור קבצי CSV
const createCsvWriter = require('csv-writer').createObjectCsvWriter;  // מודול לכתיבת קבצי CSV

// פונקציה לניקוי טקסט
function cleanText(text) {
    return text.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();  // הסרת תווים מיוחדים והמרה לאותיות קטנות
}

// פונקציה לבניית אוצר מילים מהנתונים
function buildVocabulary(data) {
    let vocabularySet = new Set();  // יצירת קבוצה לשמירת מילים ייחודיות
    data.forEach(row => {
        const words = row.text.split(' ');  // פיצול הטקסט למילים
        words.forEach(word => {
            vocabularySet.add(word);  // הוספת כל מילה לאוצר המילים
        });
    });
    return Array.from(vocabularySet);  // המרת הקבוצה למערך
}

// פונקציה להמרת טקסט לוקטור
function textToVector(text, vocabulary) {
    let vector = new Array(vocabulary.length).fill(0);  // יצירת וקטור באורך אוצר המילים
    text.split(' ').forEach(word => {
        const index = vocabulary.indexOf(word);  // מציאת מיקום המילה באוצר
        if (index !== -1) {
            vector[index] = 1;  // הצבת 1 במיקום המילה בווקטור
        }
    });
    return vector;  // החזרת הווקטור
}

// פונקציה לחלוקת נתונים לקבוצות אימון, וולידציה ובדיקה
function splitData(data, trainSize = 0.7, testSize = 0.3) {
    const shuffled = data.sort(() => 0.5 - Math.random());  // ערבוב הנתונים
    const splitIdx = Math.floor(trainSize * data.length);  // חישוב נקודת החלוקה
    const trainingSet = shuffled.slice(0, splitIdx);  // יצירת קבוצת אימון
    const testingSet = shuffled.slice(splitIdx);  // יצירת קבוצת בדיקה
    return { trainingSet, testingSet };
}

// פונקציה לקריאת קובץ CSV, ניקוי נתונים, בניית אוצר מילים, המרת טקסט לוקטורים וחלוקה לנתונים
function processAndSplitCSV(inputFilePath, trainingOutputPath, testingOutputPath) {
    let data = [];

    fs.createReadStream(inputFilePath)
        .pipe(csv())  // קריאת הקובץ באמצעות סטרים ופרסור כ-CSV
        .on('data', (row) => {
            row.text = cleanText(row.text);  // ניקוי הטקסט
            data.push(row);  // הוספת השורה למערך הנתונים
        })
        .on('end', () => {
            console.log('CSV file successfully processed and cleaned');  // הדפסת הודעה בסיום העיבוד
            const vocabulary = buildVocabulary(data);  // בניית אוצר מילים
            data = data.map(row => ({
                ...row,
                textVector: textToVector(row.text, vocabulary)  // המרת הטקסט לוקטור
            }));

            const { trainingSet, testingSet } = splitData(data);  // חלוקת הנתונים לקבוצות
            writeCSV(trainingOutputPath, trainingSet, vocabulary);  // כתיבת קובץ אימון
            writeCSV(testingOutputPath, testingSet, vocabulary);  // כתיבת קובץ בדיקה
        });
}

// פונקציה לכתיבת נתונים עם וקטורים לקובץ CSV חדש
function writeCSV(filePath, data, vocabulary) {
    const csvWriter = createCsvWriter({
        path: filePath,  // הגדרת נתיב הקובץ
        header: [
            {id: 'id', title: 'ID'},  // כותרות העמודות
            {id: 'source', title: 'SOURCE'},
            {id: 'sentiment', title: 'SENTIMENT'},
            {id: 'text', title: 'TEXT'},
            ...vocabulary.map(word => ({id: `word_${word}`, title: `WORD_${word.toUpperCase()}`}))
        ]
    });

    const formattedData = data.map(row => {
        const wordEntries = Object.fromEntries(row.textVector.map((val, idx) => [`word_${vocabulary[idx]}`, val]));
        return {
            id: row.id,
            source: row.source,
            sentiment: row.sentiment,
            text: row.text,
            ...wordEntries
        };
    });

    csvWriter.writeRecords(formattedData)  // כתיבת הנתונים לקובץ
    .then(() => console.log('Data with vectors written successfully to the output file.'));
}

// נתיבים לקבצי ה-CSV
const trainingDataPath = './data/twitter_training.csv';
const trainingOutputPath = './data/processed_twitter_training.csv';
const testingOutputPath = './data/processed_twitter_testing.csv';
const validationDataPath = './data/twitter_validation.csv';
const validationOutputPath = './data/processed_twitter_validation.csv';

// עיבוד קבצי הנתונים
processAndSplitCSV(trainingDataPath, trainingOutputPath, testingOutputPath);
processCSV(validationDataPath, validationOutputPath);
