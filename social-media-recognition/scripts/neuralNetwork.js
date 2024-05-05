// ייבוא הספריות הנדרשות
const brain = require('brain.js');  // ייבוא ספריית brain.js לפיתוח רשתות נוירונים
const fs = require('fs');  // ייבוא ספריית file system לטיפול בקבצים
const parse = require('csv-parse/lib/sync');  // ייבוא ספריית csv-parse לקריאת קבצי CSV

// פונקציה לטעינת והכנת נתונים מקובץ CSV
function loadData(filePath) {
    const csvData = fs.readFileSync(filePath, 'utf-8');  // קריאת קובץ ה-CSV לתוך משתנה
    const records = parse(csvData, {
        columns: true,  // הגדרה ששמות העמודות בשורה הראשונה
        skip_empty_lines: true  // דילוג על שורות ריקות
    });
    return records.map(record => ({
        input: record.text.split(',').map(Number),  // המרת הטקסט למערך מספרים
        output: { positive: Number(record.sentiment === 'positive'), 
                  negative: Number(record.sentiment === 'negative'), 
                  neutral: Number(record.sentiment === 'neutral') }
    }));
}

// טעינת נתוני אימון ווולידציה
const trainingData = loadData('./data/processed_twitter_training.csv');
const validationData = loadData('./data/processed_twitter_validation.csv');

// יצירת רשת נוירונית קדימית
let network = new brain.NeuralNetwork({
    hiddenLayers: [20, 20]  // מספר השכבות הנסתרות והנוירונים בכל שכבה
});

// יצירת רשת LSTM
let lstmNetwork = new brain.recurrent.LSTM({
    inputSize: 20,  // גודל וקטור הקלט
    hiddenLayers: [20, 20],  // מספר השכבות הנסתרות והנוירונים בכל שכבה
    outputSize: 3  // גודל שכבת הפלט
});

// פונקציה לאימון הרשת הנוירונית הקדימית
function trainModel() {
    network.train(trainingData, {
        iterations: 2000,  // מספר האיטרציות לאימון
        log: true,  // הפעלת דיווח על האימון
        logPeriod: 100,  // תדירות הדיווחים
        learningRate: 0.01  // שיעור הלמידה
    });
    console.log('Neural Network training complete.');  // הדפסת הודעה על סיום האימון
}

// פונקציה לאימון הרשת LSTM
function trainLSTMModel() {
    lstmNetwork.train(trainingData, {
        iterations: 2000,
        log: true,
        logPeriod: 100,
        learningRate: 0.01
    });
    console.log('LSTM Network training complete.');
}

// פונקציה לבדיקת המודל באמצעות נתוני הוולידציה
function testModel(model) {
    validationData.forEach((item, index) => {
        const output = model.run(item.input);
        console.log(`Test ${index + 1}: Expected - ${Object.keys(item.output).find(key => item.output[key] === 1)}, Predicted - ${output}`);
    });
}

// ייצוא הפונקציות לשימוש חוץ
module.exports = { trainModel, trainLSTMModel, testModel, saveModel };
