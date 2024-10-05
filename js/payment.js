document.getElementById('card-number').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\s+/g, '');
    if (value.length > 16) {
        value = value.slice(0, 16); 
    }

    e.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
});