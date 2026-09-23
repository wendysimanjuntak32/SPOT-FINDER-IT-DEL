/**
 * Math Quest - Adaptive Math Engine
 * Generates exciting and balanced math problems with intelligent distractors.
 */

class MathEngine {
    constructor() {}

    /**
     * Generate a question based on world operation and stage difficulty level
     */
    generateQuestion(operation, stageIndex = 1, isBoss = false) {
        let questionData = null;

        switch (operation) {
            case 'add':
                questionData = this.generateAddition(stageIndex, isBoss);
                break;
            case 'sub':
                questionData = this.generateSubtraction(stageIndex, isBoss);
                break;
            case 'mul':
                questionData = this.generateMultiplication(stageIndex, isBoss);
                break;
            case 'div':
                questionData = this.generateDivision(stageIndex, isBoss);
                break;
            case 'mixed':
            default:
                questionData = this.generateMixed(stageIndex, isBoss);
                break;
        }

        // Generate 4 plausible distinct choices
        const choices = this.generateChoices(questionData.answer, questionData.type || operation);
        questionData.choices = choices;

        return questionData;
    }

    // 1. Penjumlahan
    generateAddition(stage, isBoss) {
        let a, b, prompt, answer, equation;
        const subType = Math.random();

        if (stage === 1) {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * 9) + 1;
        } else if (stage === 2) {
            a = Math.floor(Math.random() * 25) + 5;
            b = Math.floor(Math.random() * 25) + 5;
        } else {
            a = Math.floor(Math.random() * 50) + 15;
            b = Math.floor(Math.random() * 50) + 15;
        }

        if (isBoss && subType > 0.4) {
            // Missing operand puzzle: a + ? = sum
            const sum = a + b;
            prompt = `Berapa nilai tanda tanya (?)`;
            equation = `${a} + ? = ${sum}`;
            answer = b;
        } else {
            prompt = `Hitung hasil penjumlahan berikut:`;
            equation = `${a} + ${b} = ?`;
            answer = a + b;
        }

        return {
            prompt,
            equation,
            answer,
            type: 'add'
        };
    }

    // 2. Pengurangan
    generateSubtraction(stage, isBoss) {
        let a, b, prompt, answer, equation;
        const subType = Math.random();

        if (stage === 1) {
            b = Math.floor(Math.random() * 9) + 1;
            a = b + Math.floor(Math.random() * 10) + 1; // ensure positive
        } else if (stage === 2) {
            b = Math.floor(Math.random() * 30) + 5;
            a = b + Math.floor(Math.random() * 30) + 5;
        } else {
            b = Math.floor(Math.random() * 60) + 10;
            a = b + Math.floor(Math.random() * 60) + 10;
        }

        if (isBoss && subType > 0.4) {
            const diff = a - b;
            prompt = `Cari angka pengurangan yang hilang:`;
            equation = `${a} - ? = ${diff}`;
            answer = b;
        } else {
            prompt = `Hitung hasil pengurangan berikut:`;
            equation = `${a} - ${b} = ?`;
            answer = a - b;
        }

        return {
            prompt,
            equation,
            answer,
            type: 'sub'
        };
    }

    // 3. Perkalian
    generateMultiplication(stage, isBoss) {
        let a, b, prompt, answer, equation;
        const subType = Math.random();

        if (stage === 1) {
            a = Math.floor(Math.random() * 7) + 2;
            b = Math.floor(Math.random() * 7) + 2;
        } else if (stage === 2) {
            a = Math.floor(Math.random() * 9) + 3;
            b = Math.floor(Math.random() * 11) + 2;
        } else {
            a = Math.floor(Math.random() * 12) + 4;
            b = Math.floor(Math.random() * 12) + 3;
        }

        if (isBoss && subType > 0.4) {
            const prod = a * b;
            prompt = `Temukan faktor perkalian yang tepat:`;
            equation = `${a} × ? = ${prod}`;
            answer = b;
        } else {
            prompt = `Hitung hasil perkalian berikut:`;
            equation = `${a} × ${b} = ?`;
            answer = a * b;
        }

        return {
            prompt,
            equation,
            answer,
            type: 'mul'
        };
    }

    // 4. Pembagian
    generateDivision(stage, isBoss) {
        let divisor, quotient, dividend, prompt, answer, equation;
        const subType = Math.random();

        if (stage === 1) {
            divisor = Math.floor(Math.random() * 6) + 2;
            quotient = Math.floor(Math.random() * 7) + 1;
        } else if (stage === 2) {
            divisor = Math.floor(Math.random() * 9) + 2;
            quotient = Math.floor(Math.random() * 10) + 2;
        } else {
            divisor = Math.floor(Math.random() * 12) + 3;
            quotient = Math.floor(Math.random() * 12) + 2;
        }

        dividend = divisor * quotient;

        if (isBoss && subType > 0.4) {
            prompt = `Berapa angka pembagi yang hilang?`;
            equation = `${dividend} ÷ ? = ${quotient}`;
            answer = divisor;
        } else {
            prompt = `Hitung hasil pembagian berikut:`;
            equation = `${dividend} ÷ ${divisor} = ?`;
            answer = quotient;
        }

        return {
            prompt,
            equation,
            answer,
            type: 'div'
        };
    }

    // 5. Aljabar Campuran & KABATAKU (PEMDAS)
    generateMixed(stage, isBoss) {
        const randType = Math.floor(Math.random() * 4);

        if (randType === 0) {
            // PEMDAS: a + b * c
            const a = Math.floor(Math.random() * 15) + 2;
            const b = Math.floor(Math.random() * 6) + 2;
            const c = Math.floor(Math.random() * 6) + 2;
            const answer = a + (b * c);
            return {
                prompt: `Ingat urutan operasi (KABATAKU)!`,
                equation: `${a} + ${b} × ${c} = ?`,
                answer: answer,
                type: 'pemdas'
            };
        } else if (randType === 1) {
            // Parentheses: (a - b) * c
            const b = Math.floor(Math.random() * 8) + 2;
            const a = b + Math.floor(Math.random() * 6) + 2;
            const c = Math.floor(Math.random() * 5) + 2;
            const answer = (a - b) * c;
            return {
                prompt: `Selesaikan di dalam kurung terlebih dahulu:`,
                equation: `(${a} - ${b}) × ${c} = ?`,
                answer: answer,
                type: 'brackets'
            };
        } else if (randType === 2) {
            // Variable Equation: 2x + a = b
            const x = Math.floor(Math.random() * 8) + 2;
            const mult = Math.floor(Math.random() * 3) + 2;
            const add = Math.floor(Math.random() * 10) + 1;
            const result = (mult * x) + add;
            return {
                prompt: `Carilah nilai X dari persamaan sihir:`,
                equation: `${mult}X + ${add} = ${result}`,
                answer: x,
                type: 'algebra'
            };
        } else {
            // Mixed double operations: a * b - c
            const a = Math.floor(Math.random() * 8) + 3;
            const b = Math.floor(Math.random() * 7) + 2;
            const c = Math.floor(Math.random() * 15) + 1;
            const answer = (a * b) - c;
            return {
                prompt: `Hitung persamaan kombinasi berikut:`,
                equation: `${a} × ${b} - ${c} = ?`,
                answer: answer,
                type: 'mixed'
            };
        }
    }

    /**
     * Smart distractor generator for 4 unique answer options
     */
    generateChoices(correctAnswer, type) {
        const choices = new Set([correctAnswer]);

        const offsets = [-1, 1, -2, 2, -10, 10, -5, 5, -3, 3];
        // Shuffle offsets
        for (let i = offsets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
        }

        for (let off of offsets) {
            const val = correctAnswer + off;
            if (val >= 0 && val !== correctAnswer) {
                choices.add(val);
            }
            if (choices.size >= 4) break;
        }

        // Fallback if still under 4 choices
        let fallback = 1;
        while (choices.size < 4) {
            const candidate = correctAnswer + fallback;
            if (candidate >= 0 && !choices.has(candidate)) {
                choices.add(candidate);
            }
            fallback++;
        }

        // Return shuffled array of choices
        const choicesArr = Array.from(choices);
        for (let i = choicesArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choicesArr[i], choicesArr[j]] = [choicesArr[j], choicesArr[i]];
        }

        return choicesArr;
    }
}

window.mathEngine = new MathEngine();
