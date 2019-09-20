const a = new Promise((res) => {
    console.log('fffff');
    setTimeout(function(){
        console.log('after timeout');
        res("Success!"); // Ура! Всё прошло хорошо!
    }, 250);
});

a.then((val) =>  { console.log('fulfill then-resolve'); return '1' });