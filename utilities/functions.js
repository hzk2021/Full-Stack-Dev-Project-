const { Menu } = require('../models/Menu');
const { MenuCategory } = require('../models/MenuCategory')
const { Supplies } = require('../models/Supplies');
const { SupplyCategory } = require('../models/SupplyCategory');
const Sequelize = require('sequelize');

// Format: [{day_no:5, food_name:Wow, food_name2: Woahx2}]
const arrange_rewards = function (prizes) {
    let merged_prizes = [];
    var temp = 0;
    try {
        // Referencing an attribute to bring empty list to catch to fill up the list
        let test_empty = prizes[0].day_no;
        merged_prizes = [prizes[0]];

        // Referencing a 2nd index so as to bring list to catch to fill when there is only 1 reward
        temp = 5;
        let test_length1 = prizes[1].day_no;

        var day_track = 2;
        var merged_i = 0;
        for (i = 1; i < prizes.length+1; i++) {
            // Add only when the loop runs to another item of another day
            if (temp != prizes[i].day_no) {
                temp += 5;
            }
            // Add rewards of the same day as previous into its dictionary
            if (temp == merged_prizes[merged_i].day_no) {
                var isInside = false
                // Find for rewards that has the same name to stack onto each other
                for (var food in merged_prizes[merged_i]) {
                    // Stacking same items together to reduce duplicates in display
                    var food_name = merged_prizes[merged_i][food];
                    try {
                        var last_char = food_name.length-3;
                        if (food_name == prizes[i].food_name || food_name.substr(0, last_char) == prizes[i].food_name) {
                            var dup_record = parseInt(food_name.slice(food_name.length - 1));
                            if (Number.isNaN(dup_record)) {
                                dup_record = 1
                                last_char = food_name.length
                            }
                            dup_record++;
                            merged_prizes[merged_i][food] = food_name.substr(0, last_char) + " x"+dup_record;
                            isInside = true
                            break;
                        }
                    }
                    // Skip if its checking against day_no key
                    catch (TypeError) {
                        continue;
                    }
                }
                // If no add as another reward
                if (!isInside && prizes[i].food_name != null) {
                    console.log(prizes[i].food_name);
                    merged_prizes[merged_i]['food_name'+day_track] = prizes[i]['food_name'];
                }
                day_track++;
            }
            // Or add it as another day
            else {
                merged_i++;
                day_track = 2;
                // Insert dictionary of null for unfilled days
                if (prizes[i]['day_no'] != temp) {
                    merged_prizes.push({ day_no:temp, food_name:null });
                    console.log("Filled null");
                }
                else {
                    merged_prizes.push(prizes[i]);
                }
            }
        }
    }
    catch (error) {
        console.log("Reached the end of the rewards list");
        for (i=temp+5; i<61; i+=5) {
            merged_prizes.push({ day_no:i, food_name: null });
        }
    }
    finally {
        console.log(merged_prizes);
        return merged_prizes
    }
}

const arrange_user_rewards = function (prizes) {
    let merged_prizes = [];
    var temp = 0;
    try {
        // Referencing an attribute to bring empty list to catch to fill up the list
        let test_empty = prizes[0].day_no;
        merged_prizes = [prizes[0]];

        // Referencing a 2nd index so as to bring list to catch to fill when there is only 1 reward
        temp = 5;
        let test_length1 = prizes[1].day_no;

        var day_track = 2;
        var merged_i = 0;
        for (i = 1; i < prizes.length+1; i++) {
            // Add only when the loop runs to another item of another day
            if (temp != prizes[i].day_no) {
                temp += 5;
            }
            // Add rewards of the same day as previous into its dictionary
            if (temp == merged_prizes[merged_i].day_no) {
                var isInside = false
                // Find for rewards that has the same name to stack onto each other
                for (var food in merged_prizes[merged_i]) {
                    // Stacking same items together to remove duplicates in display
                    var food_name = merged_prizes[merged_i][food];
                    try {
                        var last_char = food_name.length-3;
                        if (food_name == prizes[i].food_name || food_name.substr(0, last_char) == prizes[i].food_name) {
                            var dup_record = parseInt(food_name.slice(food_name.length - 1));
                            if (Number.isNaN(dup_record)) {
                                dup_record = 1
                                last_char = food_name.length
                            }
                            dup_record++;
                            merged_prizes[merged_i][food] = food_name.substr(0, last_char) + " x"+dup_record;
                            isInside = true
                            break;
                        }
                    }
                    // Skip if its checking against day_no key
                    catch (TypeError) {
                        continue;
                    }
                }
                // If no add as another reward
                if (!isInside) {
                    merged_prizes[merged_i]['food_name'+day_track] = prizes[i]['food_name'];
                }
                day_track++;
            }
            // Or add it as another day
            else {
                merged_i++;
                day_track = 2;
                // Insert dictionary of null for unfilled days
                if (prizes[i]['day_no'] != temp) {
                    merged_prizes.push({ day_no:temp, food_name:null });
                    console.log("Filled null");
                }
                else {
                    merged_prizes.push(prizes[i]);
                }
            }
        }
    }
    catch (error) {
        console.log("Reached the end of the rewards list");
        return merged_prizes
    }
}

// Format: [ {day_no: 5, length: 2, prizes: [Food1, Food2]} ]
const arrange_rewards_tab = function (prizes) {
    let sorted_list = [];
    if (prizes.length == 0) {
        return sorted_list
    }
    let sorted_dict = {day_no: prizes[0].day_no, length:1, prizes:[]};
    let iterated_values = {};
    iterated_values[prizes[0].food_name] = 1;
    
    for (i=1; i<prizes.length; i++) {
        if (prizes[i].day_no == sorted_dict.day_no) {
            if (prizes[i].food_name in iterated_values) {
                iterated_values[prizes[i].food_name]++;
            }
            else {
                iterated_values[prizes[i].food_name] = 1;
                sorted_dict.length++;
            }
            if (i==prizes.length-1) {
                for (var key in iterated_values) {
                    if (iterated_values[key] == 1) {
                        sorted_dict.prizes.push(key);
                    }
                    else {
                        sorted_dict.prizes.push(key+" x"+iterated_values[key]);
                    }
                }
                sorted_list.push(sorted_dict);
            }
        }
        else {
            // Adding the food into the list
            for (var key in iterated_values) {
                if (iterated_values[key] == 1) {
                    sorted_dict.prizes.push(key);
                }
                else {
                    sorted_dict.prizes.push(key+" x"+iterated_values[key]);
                }
            }
            sorted_list.push(sorted_dict);
            sorted_dict = {day_no: prizes[i].day_no, length:1, prizes:[prizes[i].food_name]};
            iterated_values = {};
            if (i==prizes.length-1) {
                sorted_list.push(sorted_dict);
            }
        }
    }
    if (prizes.length == 1) {
        sorted_dict.prizes.push(prizes[0].food_name);
        sorted_list.push(sorted_dict);
    }
    console.log(sorted_list);
    return sorted_list;
}

// Format: { SID:[1,2,3,4,5,6,7], SEA:[1,2,3,4]  }
const arrange_menu_categories = async function () {
    const food_list = await Menu.findAll({
        attributes:['item_name', 'category_no'],
        order:[['category_no', 'ASC'], ['item_name', 'ASC']],
        raw: true
    });
    const categories = await MenuCategory.findAll({});
    
    let sorted_list = [];
    try {
        for (var cat in categories) {
            let sorted_food = {};
            // Set each category values
            var cat_items = food_list.filter(food => food.category_no == categories[cat].category_no).map(item => item.item_name);
            sorted_food['category'] = categories[cat].category_name
            sorted_food['dishes'] = cat_items;
            sorted_list.push(sorted_food);
        }
        console.log(sorted_list);
        return sorted_list
    }      
    catch (error) {
        console.log('Courses has yet been yet');
        console.log(error);
        return null
    }
}

// Format: { SID:[ [1,2,3,4,5], [1,2] ], SEA:[ [1,2,3,4] ] }
const arrange_supplies_menu_checkbox = async function () {
    const food_list = await Supplies.findAll({
        attributes:['item_id', 'item_name', 'category_no'],
        order:[['category_no', 'ASC'], ['item_name', 'ASC']],
        raw: true
    });
    const categories = await SupplyCategory.findAll({});
    
    let sorted_food = {};
    try {
        for (var cat in categories) {
            // Set key as course name
            // {SID: []};
            let list_counter = [];
            let current_list = food_list.filter(food => food.category_no == categories[cat].category_no);
            while (current_list.length != 0) {
                // [ [1,2,3,4,5] ]
                list_counter.push(current_list.slice(0, 5));
                // Push the list of 5 into the course as value
                current_list = current_list.slice(5, current_list.length);
            }
            sorted_food[categories[cat].category_name] = list_counter;
        }
        console.log(sorted_food);
        return sorted_food 
    }      
    catch (error) {
        console.log('Courses has yet been yet');
        console.log(error);
        return null
    }
}

// Format: [ {name: <name>, id: <id>, values: [week1, week2, week3]}, {name: <name>, id: <id>, values: [week1, week2, week3]} ]
const arrange_supplies_by_food_weekNo = function (supplies) {
    let items_list = [];
    let item_dict = {};
    if (supplies.length == 0) {
        items_list.push(item_dict);
        return items_list;
    }

    item_dict.name = supplies[0].item_name;
    item_dict.id = supplies[0].item_id;
    item_dict.values = [supplies[0]['supply_performances.stock_used']];

    var check_id = item_dict.id;
    if (supplies.length <= 1) {
        items_list.push(item_dict);
    }
    else {
        for (i=1; i<supplies.length; i++) {
            if (supplies[i].item_id == check_id) {
                item_dict.values.push(supplies[i]['supply_performances.stock_used']);
                if (i == supplies.length-1) {
                    items_list.push(item_dict);
                }
            }
            else {
                items_list.push(item_dict);
                check_id = supplies[i].item_id
                item_dict = {};
                item_dict.name = supplies[i].item_name;
                item_dict.id = supplies[i].item_id;
                item_dict.values = [supplies[i]['supply_performances.stock_used']];
                if (i == supplies.length-1) {
                    items_list.push(item_dict);
                }
            }
            
        }
    }
    console.log(items_list);
    return items_list;
}

const arrange_supplies_by_food_weekNo_full = function (supplies) {
    var result = arrange_supplies_by_food_weekNo(supplies);
    for (var item in result) {
        while (result[item].values.length < 5) {
            result[item].values.push(0);
        }
    }
    return result;
}


module.exports = {arrange_rewards, arrange_user_rewards, arrange_menu_categories, arrange_supplies_menu_checkbox, arrange_supplies_by_food_weekNo, 
                arrange_supplies_by_food_weekNo_full, arrange_rewards_tab};