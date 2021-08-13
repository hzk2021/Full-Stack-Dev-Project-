const Menu = require('../models/Menu');
const { Supplies } = require('../models/Supplies');
const { SupplyCategory } = require('../models/SupplyCategory');
const Sequelize = require('sequelize');

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
        for (i=temp+5; i<61; i+=5) {
            merged_prizes.push({ day_no:i, food_name: null });
        }
    }
    finally {
        console.log(merged_prizes);
        return merged_prizes
    }
}


const arrange_rewards_noNull = function (prizes) {
    let list = arrange_rewards(prizes);
    let endList = list;
    for (var obj in list) {
        if (list[obj].food_name == null) {
            endList.splice(obj, 1);
        }
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
    item_dict.name = supplies[0].item_name;
    item_dict.id = supplies[0].item_id;
    item_dict.values = [supplies[0]['supply_performances.stock_used']];

    var check_id = item_dict.id;
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
        }
        
    }
    console.log(items_list);
    items_list[0].values = [0, 0, 10000];
    return items_list;
}


module.exports = {arrange_rewards, arrange_rewards_noNull, arrange_supplies_menu_checkbox, arrange_supplies_by_food_weekNo};