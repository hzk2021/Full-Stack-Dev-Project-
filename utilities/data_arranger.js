const Menu = require('../models/Menu');
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



const arrange_supplies_menu_checkbox = async function () {
    const food_list = await Menu.findAll({
        attributes:['item_name', 'item_course'],
        order:[['item_name', 'ASC']],
        raw: true
    });

    const food_courses = await Menu.findAll({
        attributes:[[Sequelize.fn('DISTINCT', Sequelize.col('item_course')), 'item_course']],
        raw: true
    })

    let sorted_food = [];
    try {
        for (var course in food_courses) {
            let list_counter = []
            let current_list = food_list.filter(food => food.item_name == food_courses[course].item_course);
            while (current_list.length != 0) {
                list_counter.push(current_list.slice(0, 5));
                current_list = current_list.slice(5, current_list.length);
            }
            for (var li in list_counter) {
                sorted_food.push(li);
            }
        }
        return sorted_food 
    }      
    catch (error) {
        console.log('Courses has yet been yet');
        return null
    }
}

// Format: {name: <name>, id: <id>, values: [week1, week2, week3]}
const arrange_supplies_by_food_weekNo = function (supplies) {
    let sorted_list = {};
    sorted_list.name = supplies[0].item_name;
    sorted_list.id = supplies[0].item_id;
    sorted_list.values = [supplies[0].stock_used];

    var remaining = 5 - supplies.length;
    for (i=1; i<supplies.length; i++) {
        sorted_list.values.push(supplies[i].stock_used);
    }
    for (i=remaining; i>0; i-=1) {
        sorted_list.values.push(0);
    }
    console.log(sorted_list);
    return sorted_list;
}

module.exports = {arrange_rewards, arrange_rewards_noNull, arrange_supplies_menu_checkbox, arrange_supplies_by_food_weekNo};