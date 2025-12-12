// トグルボタン
document.querySelectorAll('.toggle-option').forEach(option => {
    option.addEventListener('click', () => {
        option.parentElement.querySelectorAll('.toggle-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
    });
});