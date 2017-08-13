var Nightmare = require('nightmare');	
var os = require('os');
var fs = require('fs');

let m = new Nightmare({
    show: true
});

var image_index = 0;
var iter_index = 0;
var final_data = [];

function scrapeThis(current_page) {
    return m
            .wait("#body_gvRevViolations")
            .wait(1000)
            .evaluate(function(iter_index, os) {
                var data = [];
                alert("Asas");
                var table = document.getElementById("body_gvRevViolations");
                for (var i = 1, row; row = table.rows[i]; i++) {
                    var obj = [];
                    for (var j = 0, col; col = row.cells[j]; j++) {
                        if(j >= 3 && j<=5) {
                            obj.push(col.innerText);    
                        } else if(j == 8) {
                            obj.push("image_"+((iter_index*10)+i)+".png");    
                        } else {
                            obj.push(col.innerHTML);
                        }
                    }
                    data.push(obj);  
                }
                console.log(data);
                return data;
            }, iter_index, os)
            .then(function(result) {
                //console.log(final_data);
                //console.log(final_data.length);
                for(var i=0; i<result.length; i++) {
                    for(var j=0; j<result[i].length; j++) {
                        console.log(((iter_index*10)+i));
                        final_data[((iter_index*10)+i)][j] = result[i][j];
                    }
                    fs.appendFile('data.txt', os.EOL+JSON.stringify(final_data[((iter_index*10)+i)]));
                }
                iter_index++;
                console.log("Iteration: "+iter_index+", "+(iter_index*10)+" Rows Wriiten");
                if(iter_index <= 500) {
                    return m
                        .click('#body_ucPaging_lnkbtnNext')
                        .wait(3000)
                        .then(() => {
                            return scrape(++current_page, 0);  
                        })
                        .then(() => {
                            console.log(""+iter_index+" Iteration Done");
                        });
                } else {
                    return;
                }
            })
            .catch(function(error) {
                console.log(error);
            });
}

function scrapePage(index) {
    console.log("Scrape Page: "+index);
    return m
            .wait(('#body_gvRevViolations_lnkView_'+index))    
            .click(('#body_gvRevViolations_lnkView_'+index))
            .wait(1000)
            .wait("#RearImage")
            .wait("#heading_btnBack")
            .screenshot(("images/image_"+(++image_index)+".png"), {x: 500, y: 150, width: 650, height: 200})
            .evaluate(function() {
                var data_obj = {
                    "9" : document.getElementById("body_fvTrxnVehInfo_lblVehicleState").nextElementSibling.innerText,
                    "10" : document.getElementById("body_fvTrxnVehInfo_lblAVCClass").nextElementSibling.innerText,
                    "11" : document.getElementById("body_fvTrxnVehInfo_lblTagVehicleClass").nextElementSibling.innerText,
                    "12" : document.getElementById("body_fvTrxnVehInfo_lblCorrectedClass").nextElementSibling.innerText
                };
                return data_obj;
            })
            .then(function(res) {
                final_data.push(res);
            })
            .then(() => {
                return m.click("#heading_btnBack");
            })
            .catch(function(error) {
                console.log(error);
            });
}

function scrape(current_page, skip_param) {
    var skipVal = parseInt((skip_param/10), 10);
    if(skipVal >= 1) {
        while(skipVal >= 1) {
            m
            .wait('#body_ucPaging_lnkbtnNext')
            .click('#body_ucPaging_lnkbtnNext')
            .wait(1000);
            skipVal--;
        }
        image_index = skip_param;
        iter_index = skipVal;
    }
    return m
        .then(() => {
            return scrapePage(0);
        })
        .then(() => {
            return scrapePage(1);
        })
        .then(() => {
            return scrapePage(2);
        })
        .then(() => {
            return scrapePage(3);
        })
        .then(() => {
            return scrapePage(4);
        })
        .then(() => {
            return scrapePage(5);
        })
        .then(() => {
            return scrapePage(6);
        })
        .then(() => {
            return scrapePage(7);
        })
        .then(() => {
            return scrapePage(8);
        })
        .then(() => {
            return scrapePage(9);
        })
        .then(() => {
            return scrapeThis(current_page);
        });
}

m
.goto('http://fastaglogin.icicibank.com/CEBABOSACQ/Default.aspx')
.wait(1500)
.wait(`#txtPassword`)
.insert('#txtUserName', 'test1')
.insert('#txtPassword', 'ETC@12345')
.click('#btnLogin')
.wait(10000)
.then(() => {
    return scrape(1, 0);  
})
.then(() => {
    console.log("Finish Process");
});
