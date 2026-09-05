const fs = require('fs');
const data = JSON.parse(fs.readFileSync('testcase.json', 'utf8'));

function decodeValue(value, base) {
    base = BigInt(base);
    let result = 0n;
    let chars = "0123456789abcdefghijklmnopqrstuvwxyz";
    value = value.toLowerCase();
    for (let c of value) {
        result = result * base + BigInt(chars.indexOf(c));
    }
    return result;
}

let points = [];
for (let key in data) {
    if (key === "keys") continue;
    let x = BigInt(key);
    let y = decodeValue(data[key].value, data[key].base);
    points.push({ x, y });
}

let k = data.keys.k;

function gcd(a, b) {
    a = a < 0n? -a : a;
    b = b < 0n? -b : b;
    while (b!== 0n) { let t = b; b = a % b; a = t; }
    return a;
}

function lagrangeAt0(pts) {
    let resNum = 0n;
    let resDen = 1n;
    for (let j = 0; j < pts.length; j++) {
        let num = 1n, den = 1n;
        for (let m = 0; m < pts.length; m++) {
            if (m === j) continue;
            num *= -pts[m].x;
            den *= (pts[j].x - pts[m].x);
        }
        // res = res + pts[j].y * num/den
        let y_num = pts[j].y * num;
        let newNum = resNum * den + y_num * resDen;
        let newDen = resDen * den;
        let g = gcd(newNum, newDen);
        resNum = newNum / g;
        resDen = newDen / g;
    }
    return resNum / resDen;
}

// Try all combos to find correct secret (handles corrupted shares)
function getCombinations(arr, k) {
    let result = [];
    function backtrack(start, cur) {
        if (cur.length === k) { result.push([...cur]); return; }
        for (let i = start; i < arr.length; i++) {
            cur.push(arr[i]);
            backtrack(i + 1, cur);
            cur.pop();
        }
    }
    backtrack(0, []);
    return result;
}

let combos = getCombinations(points, k);
let freq = new Map();
for (let c of combos) {
    let secret = lagrangeAt0(c).toString();
    freq.set(secret, (freq.get(secret) || 0) + 1);
}

let sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
console.log("Most common secrets:");
sorted.slice(0,5).forEach(([sec, count]) => console.log(sec, "->", count, "times"));

console.log("\nFINAL SECRET:", sorted[0][0]);