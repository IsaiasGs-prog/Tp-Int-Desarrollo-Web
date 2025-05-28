export const initializeLocalStorage = () => {
    if (!localStorage.getItem('salonesDeEventos')) {
        localStorage.setItem('salonesDeEventos', JSON.stringify([])); 
        console.log('LocalStorage de salones inicializado.');
    }
};