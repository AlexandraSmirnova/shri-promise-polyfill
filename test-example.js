/*
Скрипт для проверки полифила в браузере

Основной сценарий работы промиса
Ожидаемый вывод:

42
43
137
ошибка обработана
*/
var promise1 = new Promise(function (resolve){
    resolve(42);
})

const p1 = promise1
    .then(function (value) {
        console.log(value); //42
        return value + 1;
    })
    .then(function (value) {
        console.log(value); // 43
        return new Promise(function (resolve) { resolve(137) });
    })
    .then(function (value) {
        console.log(value) // 137
        throw new Error();
    })
    .then(
        function () { console.log('Будет проигнорировано') },
        function () { return 'ошибка обработана' }
    )
    .then(function (value) {
        console.log(value) // "ошибка обработана"
    })
