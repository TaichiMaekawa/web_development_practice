let a = 1;
function add(a,b){
    let c = a+b;
    return c
}
a=0
console.log(add(a,10))

for(let i=0;i<=10;i++){
    a =a+1
    console.log(a)
}

a = 0

const button_heart = document.getElementById('button_heart')
button_heart.addEventListener('click',function(){
    a = a+1
    button_heart.textContent = a
})