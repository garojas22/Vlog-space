// Typing Animation como componente React
const { useState, useEffect } = React;

function TypingAnimation() {
    const phrases = [
        "Desarrollador Frontend",
        "Estudiante TSU Informática",
        "Apasionado por el Backend",
        "Disponible para pasantías"
    ];
    const [text, setText] = useState('');
    const [pIdx, setPIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const current = phrases[pIdx];
        const speed = deleting ? 40 : 85;

        const timer = setTimeout(() => {
            if (!deleting) {
                setText(current.slice(0, text.length + 1));
                if (text.length + 1 === current.length) {
                    setTimeout(() => setDeleting(true), 2000);
                }
            } else {
                setText(current.slice(0, text.length - 1));
                if (text.length - 1 === 0) {
                    setDeleting(false);
                    setPIdx((pIdx + 1) % phrases.length);
                }
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [text, deleting, pIdx]);

    return React.createElement('span', null,
        React.createElement('span', { className: 't' }, text),
        React.createElement('span', { className: 'cursor' })
    );
}

const root = ReactDOM.createRoot(document.getElementById('typing-root'));
root.render(React.createElement(TypingAnimation));
