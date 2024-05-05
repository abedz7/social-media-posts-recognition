// רישום לאירוע של טעינת מסמך HTML כולו
document.addEventListener('DOMContentLoaded', function () {
    // קישור פונקציה ללחיצה על הכפתור לאימון הרשת הסטנדרטית
    document.getElementById('trainStandardNetwork').addEventListener('click', function() {
        // ביצוע בקשת POST לשרת לצורך התחלת אימון רשת נוירונים סטנדרטית
        fetch('/train-standard', { method: 'POST' })
            .then(response => response.text())  // קבלת תגובה מהשרת והמרתה לטקסט
            .then(text => {
                // הצגת תוצאות האימון באלמנט HTML בעל ה-id output
                document.getElementById('output').innerHTML = 'Standard network trained: ' + text;
            });
    });

    // קישור פונקציה ללחיצה על הכפתור לאימון רשת LSTM
    document.getElementById('trainLSTMNetwork').addEventListener('click', function() {
        // ביצוע בקשת POST לשרת לצורך התחלת אימון רשת LSTM
        fetch('/train-lstm', { method: 'POST' })
            .then(response => response.text())  // קבלת תגובה מהשרת והמרתה לטקסט
            .then(text => {
                // הצגת תוצאות האימון באלמנט HTML בעל ה-id output
                document.getElementById('output').innerHTML = 'LSTM network trained: ' + text;
            });
    });

    // קישור פונקציה ללחיצה על הכפתור לבדיקת המודל
    document.getElementById('testNetwork').addEventListener('click', function() {
        // ביצוע בקשת GET לשרת לצורך בדיקת המודל
        fetch('/test', { method: 'GET' })
            .then(response => response.text())  // קבלת תגובה מהשרת והמרתה לטקסט
            .then(text => {
                // הצגת תוצאות הבדיקה באלמנט HTML בעל ה-id output
                document.getElementById('output').innerHTML = 'Test results: ' + text;
            });
    });
});
