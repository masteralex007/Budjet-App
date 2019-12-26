// budget controller part
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var ID, newItem;

            //code for new id
            if(data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }

            //creating new item

            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //adding new income to the data structure
            data.allItems[type].push(newItem)

            return newItem
        },


        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            //1.Calculate income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //2.calculate the budget= inc - exp;
            data.budget = data.totals.inc - data.totals.exp;

            //3.calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){

            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    }
   
})();


//ui controller part
var uiController     = (function(){
    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentsgeLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){

        num = Math.abs(num);             // kuch bi ho positive kr dega
        num = num.toFixed(2);            // decimal ke second position tk round kr dega 

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {

        for(var i=0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){

            var html, newHtml, element;

            //create the placeholder text
            if(type === 'inc'){
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //insert the html to dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId) {
            
            var el = document.getElementById(selectorId);
                el.parentNode.removeChild(el);

        },

        clearFields: function(){
            var fields, fieldsArr;

            //select all the input fields
            fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);

            //slice the fields and make it an array
            fieldsArr = Array.prototype.slice.call(fields);

            //loop through all the fields add clear them
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            //Shift the focus to description field
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            obj.budget > 0 ? type = 'inc' : type = 'exp';

           document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
           document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
           document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
           if(obj.percentage > 0){
               document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
           } else{
               document.querySelector(domStrings.percentageLabel).textContent = '-';
           }
           
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(domStrings.expensePercentsgeLabel);

            nodeListForEach(fields, function(current, index){

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });
        },

        displayMonth: function() {
            var now , months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(domStrings.inputButton).classList.toggle('red');
        },
        
        getDomStrings: function(){
            return domStrings;
        }
    };
})();



//overall app controller part
var controller = (function(budgetCntrl, uiCntrl){

    var setUpEventListeners = function(){
        var dom = uiCntrl.getDomStrings();

        document.querySelector(dom.inputButton).addEventListener('click', cntrlAddItem);

        //here we have no .qurerySelector because we want to add this function to whole app
        document.addEventListener('keypress', function(event){

            if(event.keyCode === 13 || event.which === 13){
                cntrlAddItem();
            }
        });

        document.querySelector(dom.container).addEventListener('click', cntrlDeleteItem);

        document.querySelector(dom.inputType).addEventListener('change', uiCntrl.changedType);
    };

    var updateBudget = function(){
        //1.Calculate the budget
        budgetCntrl.calculateBudget();

        //2.return the budget
        var budget = budgetCntrl.getBudget();

        //3.Display the budget to the ui
        uiCntrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        //1.Calculate percentages
        budgetCntrl.calculatePercentages();

        //2.Read percentages from the budget controller
        percentages = budgetCntrl.getPercentages();

        //3.Update the ui with new percentages 
        uiCntrl.displayPercentages(percentages);
        
    };
    
    var cntrlAddItem = function(){
        var input, newItem;

        //1.Get the input data(as user adds new item here)
        input = uiCntrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2.Add item to the budget controller (we push the new item to data str from here) 
            newItem = budgetCntrl.addItem(input.type, input.description, input.value)

            //3.Add item to the ui
            uiCntrl.addListItem(newItem, input.type);

            //4.Clear input fields
            uiCntrl.clearFields();

            //5.Calculate and  update budget
            updateBudget();

            //6.Calculate and  update percentages
            updatePercentages();
        }
    };

    var cntrlDeleteItem = function(event) {
        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {

            //inc-1
            splitId = itemId.split('-');
            type    = splitId[0];
            ID     = parseInt(splitId[1]);

            // 1. Delete the item from the data structure
            budgetCntrl.deleteItem(type, ID);

            // 2. Delete the item from UI
            uiCntrl.deleteListItem(itemId);

            // 3. Update and show the new budjet
            updateBudget();

            //4.Calculate and  update percentages
            updatePercentages();

        }
    };

    return {
        init: function(){
            console.log("App Has Started");
            uiCntrl.displayMonth();
            uiCntrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    }
    
})(budgetController, uiController);

controller.init();