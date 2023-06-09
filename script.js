'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-04-27T17:01:17.194Z',
    '2023-05-04T23:36:17.929Z',
    '2023-05-09T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);

  // else {
  //   const day = `${date.getDate()}`.padStart(2, '0');
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class='movements__date'>${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //in each call, print the remainning time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //when 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    //decrease 1s
    time--;
  };
  let time = 600;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//FAKE ALWAYS LOGGED IN
//----------------------------
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 0;
//----------------------------------

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //create current date and time

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //numeric, long or '2-digit'
      year: 'numeric',
      // weekday: 'long',
    };

    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, '0');
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    // Update UI
    updateUI(currentAccount);
  }
  //reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);

      //Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);

    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// console.log(23 === 23.0); //true
// //base 10 0 to 9. 1/10 = 0.1, 3/10 = 3.33333333...
// //binary base 2 - 0 1
// console.log(0.1 + 0.2); //0.30000000000004 wird result in js
// console.log(0.1 + 0.2 === 0.3); //false!

// //Conversion
// console.log(Number('23')); //23
// console.log(+'23'); //plus operand changes string to number

// //Parsing
// console.log(Number.parseInt('30px', 10)); //parsing string to number, sec parameter 10 base

// console.log(Number.parseInt('2.5rem')); //2 integer = calkowite
// console.log(Number.parseFloat('2.5rem')); //2.5

// console.log(Number.isNaN(20)); //NaN (not a number) => false,

// //Checking if value is a number
// console.log(Number.isFinite(20)); //true
// console.log(Number.isFinite('20')); //false string
// console.log(Number.isFinite(+'20')); //true

// console.log(Number.isInteger(23)); //true
// console.log(Number.isInteger(23.0)); //true
// console.log(Number.isInteger(23 / 0)); //false

// //////////////////////////////////////////////////////////////////////////////
// //MATH AND ROUNDING

// console.log(Math.sqrt(25)); //5 square root, pierviastek
// console.log(25 ** (1 / 2)); //5 inny zapis
// console.log(8 ** (1 / 3)); // pierwiastek potrojny z 8 = 2 do trzeciej potegi(qubik root)

// console.log(Math.max(5, 18, 23, 11, 2)); //23
// console.log(Math.max(5, 18, '23', 11, 2)); //23

// console.log(Math.min(5, 18, 23, 11, 2)); //2

// console.log(Math.PI * Number.parseFloat('10px') ** 2); // obliczanie powierzchni kola

// console.log(Math.trunc(Math.random() * 6) + 1); //1-6 random numbers

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(10, 20));

// //Rounding Integers
// console.log(Math.trunc(23.3)); //23

// console.log(Math.round(23.3)); //23
// console.log(Math.round(23.9)); //24

// console.log(Math.ceil(23.3)); //24
// console.log(Math.ceil(23.9)); //24
// console.log(Math.ceil(-23.3)); //-23

// console.log(Math.floor(23.3)); //23
// console.log(Math.floor(-23.3)); //-24

// console.log(Math.trunc(-23.3)); //-23
// console.log(Math.floor(-23.3)); //-24 //floor better to use

//rounding decimals
//toFixed returns string
// console.log((2.7).toFixed(0)); // 2.7 str
// console.log((2.7).toFixed(3)); //2.700 str
// console.log(+(2.345).toFixed(2)); //2.35

// /////////////////////////////////////////////////////////////////////////
// //REMAINDER OPERATOR
// console.log(5 % 2); // 1
// console.log(8 % 3); //2

// console.log(6 % 2); //0

// const isEven = n => n % 2 === 0;

// console.log(isEven(7)); //false
// console.log(isEven(10)); //true

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     //0,2,4,6,
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';

//     //0,3,6,9,
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

///////////////////////////////////////////////////////////////////////////////
//NUMERIC SEPARATORS // dont use in methods

// 287_460_000_000;
// const diameter = 287_460_000_000;
// console.log(diameter); // we can use underscore separator because system is treating this as a normal number

// const price = 345_99;
// console.log(price);

// const transferFee = 15_00;
// const transferFee2 = 1_500;

////////////////////////////////////////////////////////////////////////////////
//BIG INT

// //the biggest number which can be represent in js
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);

// console.log(2 ** 53 + 1); //here starts some problem with numbers accuracy...
// console.log(2 ** 53 + 2);
// console.log(2 ** 53 + 3);

// ///BIG INTEGERS coming here to help
// console.log(24589966541233325477852223n);
// console.log(BigInt(4852136552)); //changing number to BigInt

// ///Operations on BigInt
// console.log(10000n + 10000n); //20000n
// console.log(36524889223555662222258563112555n * 100000000000n); //works

// const huge = 2024521485324855966525n;
// const num = 23;
// //console.log(huge * num); //error, bigInt cant be mixed with numbers
// console.log(huge * BigInt(num)); //works

// //LOGICAL OPERATORS and string concatenation ARE EXCEPTIONS
// console.log(20n > 15); //true
// console.log(20n === 20); //false, because different types

// console.log(huge + 'is REALLY Big!!!'); //2024521485324855966525n is REALLY Big!!!

// //Divisions
// console.log(10n / 3n); // 3n - integers!
// console.log(10 / 3); //3.333..

// /////////////////////////////////////////////////////////////////////////////////////////
// //CREATING DATES
// const nowX = new Date();
// console.log(nowX);

// console.log(new Date(' December 24,  2015'));

// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2037, 10, 19, 15, 23, 5)); //10=>11 November 0-based months

// //autocorrect dates
// console.log(new Date(2037, 10, 31)); //only 30 days in nov => 01 dec

// console.log(new Date(0)); //01.01.1970
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); //3 days later

// console.log(3 * 24 * 60 * 60 * 1000); //259_200_000

// //WORKING WITH DATES

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth()); //10 = nov
// console.log(future.getDate()); //19th
// console.log(future.getDay()); //4 => thursday
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());

// console.log(future.toISOString());

// console.log(future.getTime()); //2142256980000
// console.log(new Date(2142256980000));

// //TIMESTAMP
// console.log(Date.now()); //gives timestamp

// //set methods
// future.setFullYear(2040);
// console.log(future);

//////////////////////////////////////////////////////////////////////
//OPERATION WITH DATES
const future = new Date(2037, 10, 19, 15, 23);

console.log(+future);
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(days1); //10days

//////////////////////////////////////////////////////////////////////////////////////
//Internationalizing Numbers

const num = 3884764.23;

const options = {
  style: 'unit', //unit, percent, currency
  unit: 'celsius', //this is ignored if not necessary

  currency: 'EUR', //must define currency manually
  // useGrouping: false, // removes separators , . _
};

console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
console.log('PL: ', new Intl.NumberFormat('pl-PL', options).format(num));
console.log('DE: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria: ', new Intl.NumberFormat('ar-SY').format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(num)
);

///////////////////////////////////////////////////////////////////////////////
//TIMERS: setTimeout, setInterval

// setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   3000, //in milisekunds = 3s
//   'olives',
//   'spinach'
// );

// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );
// console.log('Waiting...');

// //clear timeOut
// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//setInterval

//printing clock to the console
// setInterval(function () {
//   const now = new Date();
//   const hour = `${now.getHours()}`.padStart(2, '0');
//   const min = `${now.getMinutes()}`.padStart(2, '0');
//   const sec = `${now.getSeconds()}`.padStart(2, '0');
//   console.log(`${hour}:${min}:${sec}`);
// }, 1000);

//////////////////////////////////////////////
//countdown timer
