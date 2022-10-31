const arr = {
    'a' : {
        'aa' : 'aaa'
    },
    'b' : {
        'bb' : 'bbb'
    }
}
const arr1 = Object.values(Object.entries(arr))
console.log(arr1)
console.log(Object.values(Object.values(arr)[0]))
// console.log(arr1[0])
// for(const [key, value] of Object.entries(arr)) {
//     console.log(`${key} ${value}`)
// }