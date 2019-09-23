// Скрипт для проверки полифила в браузере

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
        // return 3;
    })
    .then(
            function () { console.log('Будет проигнорировано') },
            function () { return 'ошибка обработана' }
    )
    .then(function (value) {
        console.log(value) // "ошибка обработана"
    })
    console.log(promise1);

console.log('-------');
// Проверка 2. Работа then после timeout
// Ожилаемый вывод:
// row executed
// timeout
// Success!

// const promise2 = new Promise((res) => {
//     setTimeout(function(){
//         console.log('resolver');
//         res("Success!"); 
//     }, 250);
// });

// promise2.then((val) =>  { 
//     console.log(val);
//     return '1';
// });
// console.log('row executed');


// const p2 = p1.then(function (value) {
//     return new Promise(function (resolve) { resolve(137) });
// })
