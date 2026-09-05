import fs from "fs";

// Read JSON file
const data = JSON.parse(
    fs.readFileSync("./testcase.json", "utf8")
);

const n = Number(data.keys.n);
const k = Number(data.keys.k);

// Convert value from given base to BigInt
function convertToDecimal(value, base) {
    const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    let result = 0n;
    base = Number(base);

    for (const ch of value.toLowerCase()) {
        const digit = digits.indexOf(ch);

        if (digit === -1 || digit >= base) {
            throw new Error(
                "Invalid digit " + ch + " for base " + base
            );
        }

        result = result * BigInt(base) + BigInt(digit);
    }

    return result;
}

// GCD
function gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;

    while (b !== 0n) {
        const temp = a % b;
        a = b;
        b = temp;
    }

    return a;
}

// Fraction
class Fraction {
    constructor(num, den = 1n) {
        if (den === 0n) {
            throw new Error("Division by zero");
        }

        if (den < 0n) {
            num = -num;
            den = -den;
        }

        const g = gcd(num, den);

        this.num = num / g;
        this.den = den / g;
    }

    add(other) {
        return new Fraction(
            this.num * other.den +
            other.num * this.den,
            this.den * other.den
        );
    }

    multiply(other) {
        return new Fraction(
            this.num * other.num,
            this.den * other.den
        );
    }

    toString() {
        if (this.den === 1n) {
            return this.num.toString();
        }

        return this.num.toString() + "/" + this.den.toString();
    }
}

// Lagrange interpolation P(0)
function lagrangeAtZero(points) {
    let result = new Fraction(0n);

    for (let i = 0; i < points.length; i++) {
        const xi = points[i].x;
        const yi = points[i].y;

        let term = new Fraction(yi);

        for (let j = 0; j < points.length; j++) {
            if (i === j) {
                continue;
            }

            const xj = points[j].x;

            term = term.multiply(
                new Fraction(-xj, xi - xj)
            );
        }

        result = result.add(term);
    }

    return result;
}

// Read the points
const points = [];

for (let i = 1; i <= n; i++) {
    const item = data[String(i)];

    points.push({
        x: BigInt(i),
        y: convertToDecimal(item.value, item.base)
    });
}

// Use the first k required roots
const selectedPoints = points.slice(0, k);

// Calculate polynomial value at x = 0
const answer = lagrangeAtZero(selectedPoints);

console.log("n =", n);
console.log("k =", k);

console.log("\nSelected points:");

for (const point of selectedPoints) {
    console.log(
        "x = " +
        point.x.toString() +
        ", y = " +
        point.y.toString()
    );
}

console.log("\nAnswer:");
console.log(answer.toString());
