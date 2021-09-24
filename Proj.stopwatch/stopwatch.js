//전체시간
var countedNum = 0;

//record index
var recordedNum = 1;

//setInterval 객체 담기위함
var myvar;

//button별 element
var startBtn = document.getElementById("startBtn");
var stopBtn = document.getElementById("stopBtn");
var resetBtn = document.getElementById("resetBtn");
var recordBtn = document.getElementById("recordBtn");

//button별 event listener등록
startBtn.addEventListener("click",startWatch);
stopBtn.addEventListener("click",stopWatch);
resetBtn.addEventListener("click",resetWatch);
recordBtn.addEventListener("click",recordWatch);

function startWatch(){
    myvar = setInterval(makeCount, 1000);
}

function makeCount(){
    countedNum++;
    makeShowTime(countedNum);
}

function makeShowTime(countedNum){
    if(countedNum%60 < 10){
        document.getElementById("secInfo").innerHTML = '0'+countedNum%60;
    } else {
        document.getElementById("secInfo").innerHTML = countedNum%60;
    }
    if(parseInt((countedNum%3600)/60) < 10){
        document.getElementById("minInfo").innerHTML = '0'+parseInt((countedNum%3600)/60);
    } else {
        document.getElementById("minInfo").innerHTML = parseInt((countedNum%3600)/60);
    }
    if(parseInt(countedNum/3600) < 10){
        document.getElementById("hourInfo").innerHTML = '0'+parseInt(countedNum/3600);
    } else {
        document.getElementById("hourInfo").innerHTML = parseInt(countedNum/3600);
    }
}

function stopWatch(){
    clearTimeout(myvar);
}

function resetWatch(){
    stopWatch();
    countedNum = 0;
    makeShowTime(countedNum);
}

function recordWatch(){
    console.log('oper');
    var hour, min, sec;
    hour = document.getElementById("hourInfo").innerHTML;
    min = document.getElementById("minInfo").innerHTML;
    sec = document.getElementById("secInfo").innerHTML;
    console.log('<ul>'+hour+':'+min+':'+sec+'<ul>');
    document.getElementById("recordBoard").innerHTML += `
        <tr>
            <td>${recordedNum}</td>
            <td>${hour}</td>
            <td>${min}</td>
            <td>${sec}</td>
        </tr>
        `;

    recordedNum++; //For next recoredNum
}