
// test code for scale


// selecting svg canvas
var svg1 = d3.select('#svg1');
// getting width 
var svgWidth = +svg1.attr('width');
// getting height
var svgHeight = +svg1.attr('height');

// var barChart = d3.select('#barchart')

// var width = +barChart.attr('width')

// barChart.attr('transform', 'translate(1050, -400)')

// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 130},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var barChart = d3.select("#barchart")
      .append("svg")
      .attr('transform', 'translate(1150, -400)')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");    


// tool tip formatting 
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return  "<h5>"+d['Movie Title']+ ' (' + d['Content Rating'] + ')' + "</h5>";
    });

// creating tool tip to be shown on hover 
svg1.call(toolTip);



// chart data attributes 
var dataAttributes = ['Duration', 'Aspect Ratio', 'IMDb Score', 'Budget', 'Gross', 'Number of Users for Reviews',
'Number of Faces in Poster', 'Number of Voted Users'];
var N = dataAttributes.length;

// Map for referencing min/max per each attribute 
var extentByAttribute = {};



// ordinal color scale for cylinder color mapping
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
var titleYears = [2010, 2011, 2012, 2013, 2014, 2015, 2016]
colorScale.domain(titleYears)
console.log(colorScale.domain())

// scatter plot scale setup
var xScale = d3.scaleLinear().range([55, 980]);
var yScale = d3.scaleLinear().range([665, 20]);




// changes scatterplot when different selection made in drop down
function onCategoryChanged() {
    var xSelected = d3.select('#xSelect').node();
    var ySelected = d3.select('#ySelect').node();
    
    // get values of select element
    var xVal = xSelected.options[xSelected.selectedIndex].value;
    var yVal = ySelected.options[ySelected.selectedIndex].value;

    //  getting year selection
    var yearSelected = d3.select('#yearSelect').node()
    var yearFilter = yearSelected.options[yearSelected.selectedIndex].value;

    // formatting token for filter
    if (yearFilter != "all") {
    yearFilter = yearFilter.substring(5);
    }  
    
    // clears svg selection of all drawings
    svg1.selectAll('*')
    .remove()

    // calling function to create with scatter plot with new dropdown
    scatPlot(xVal, yVal, yearFilter)

}

var map = {
    'duration': 'Duration',
    'aspect-ratio': 'Aspect Ratio',
    'imdb-score': 'IMDb Score',
    'budget': 'Budget',
    'gross': 'Gross',
    'number-of-users-for-reviews': 'Number of Users for Reviews',
    'number-of-faces-in-poster': 'Number of Faces in Poster',
    'number-of-voted-users': 'Number of Voted Users'
};


d3.csv('movies.csv', dataPreprocessor).then((d) => {
    data = d;
    var titleYears = [2011, 2012, 2013, 2014, 2015, 2016]
    console.log(data);


   


    

    dataAttributes.forEach(function(attribute){
        extentByAttribute[attribute] = d3.extent(d, function(d) {
            return d[attribute];
        });
    });

    // first rendering of scatplot 
    scatPlot('budget', 'gross');
});

function scatPlot(scaleX, scaleY, filterKey) {
   
    xAttr = map[scaleX]
    yAttr = map[scaleY]

    // axis related code passed 
    xScale.domain(extentByAttribute[xAttr]);
    yScale.domain(extentByAttribute[yAttr]);
    
    var xAxis = d3.axisBottom(xScale)
    var yAxis = d3.axisLeft(yScale)

    createScatPlotAxis(xAxis, yAxis);



    // for (var i = 0; i < data.length; i++) {
    //     if (data['Title Year'] == filterKey) {
    //         updatedData.push(data[)
    //     }

    // }



    createLegend();
    //go back through only pick out data with matching years

   console.log(filterKey)
   var store = data;

    if (typeof filterKey !== "undefined" && filterKey !== "all") {
        data = data.filter(function(el) { return el["Title Year"] == filterKey;}); 
    }
    else if (filterKey == "all") {
        console.log(store);
        data = store; 
    }
    

    var circleUpdate = svg1.selectAll('.circle')
        .data(data);
    
    var circlesEnter = circleUpdate.enter()
        .append('circle')
        .attr('class', 'circle')
        .style("fill", function (d) {
            return colorScale(d['Title Year']);
        })
        .attr('r', 4)
        circlesEnter.on('mouseover', toolTip.show)	
            .on('mouseout', toolTip.hide)
        .on("click", function(d,i) {
            barChart.selectAll('*').remove()
            createBarChart(d)
        })
       . on('dblclick', function (d) {
            barChart.selectAll('*').remove()
        })
    
    circleUpdate.merge(circlesEnter)
        .attr('cx', function (d) {
            return xScale(d[xAttr]) + 50;
        })
        .attr('cy', function(d){
            return yScale(d[yAttr]);
        });

    circleUpdate.exit().remove();
    data = store;
}
// 50, 700
function createScatPlotAxis(xAxis, yAxis) {
    svg1.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(50 , 700)')
    .call(xAxis)

    svg1.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(75 ,0)')
    .call(yAxis)

    

}

// function to create legend 

function createLegend(){

    svg1.selectAll('.squares')
    .data(titleYears)
    .enter()
    .append("rect")
    .attr("x", 1100)
    .attr("y", function(d,i){ return 100 + i*(20+5)}) 
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", function(d){ return colorScale(d)})

    svg1.selectAll("myLabels")
    .data(titleYears)
    .enter()
    .append("text")
    .attr("x", 1100 + 20 *1.2)
    .attr("y", function(d,i){ return 100 + i*(20+5) + (20/2)}) 
    .style("fill", function(d){ return colorScale(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

    svg1.append("text")
            .text("Movie Year")
            .style("text-decoration", "underline")
            .attr("transform", "translate(1100,80)")

}

function createBarChart(selectedData) {

    console.log(selectedData['Movie Title'])
    var Data= [
        { key: "actor_1_facebook_likes", value: selectedData['Actor 1 Facebook Likes']},
        { key: "actor_2_facebook_likes", value:  selectedData['Actor 2 Facebook Likes']},
        { key: "actor_3_facebook_likes", value: selectedData['Actor 3 Facebook Likes']},
        { key: "director_facebook_likes", value: selectedData['Director Facebook Likes']},
        { key: "cast_total_facebook_likes", value: selectedData['Cast Total Facebook Likes']},
        { key: "movie_facebook_likes", value: selectedData['Movie Facebook Likes']}
    ]

    var length = Data.length

    var selectedValues = Data.map(({ value }) => value);

  


    var max = Math.max(...selectedValues)
   

    // var barScale = d3.scaleLinear().range([5, width - 45]).domain([0, max]);
    
    // console.log(barScale)
    // var bars = barChart.selectAll('.bar')
    //                     .data(Data, function(data) {
    //                         return data.key
    //                     })
    
    // var barsEnter = bars.enter()
    //                     .append('g')
    //                     .attr('class', 'bar')
    //                     .attr('fill', 'blue')

    // barsEnter.merge(bars)
    //          .attr('transform', function (d, i) {
    //             return 'translate(0, ' + (345/length * i + 4) + ')';
    //     });

    // barsEnter.append('rect')
    // .attr('width', function(d) {
    //     console.log(d.value)
        
    //     return barScale(d.value);
    // })
    // .attr('height', (345) / length - 10)
    // .attr('transform', 'translate(50,0)');

    // barsEnter.append('text')
    //     .attr('x', 3)
    //     .attr('y', 35)
    //     .attr("fill", "black")
    //     .text(function(d) {
    //         return d.key;
    //     })

    var xAxis = d3.scaleLinear()
        .domain([0, max])
        .range([ 0, width]);
       
       
    

    var yAxis = d3.scaleBand()
        .range([0, height])
        .domain(Data.map(function(d) { 
            console.log(d.key)
            return d.key; }))
        .padding(.1);
    
    createBarAxis(xAxis, yAxis);

    barChart.selectAll("myRect")
        .data(Data)
        .enter()
        .append("rect")
        .attr("x", xAxis(0) )
        .attr("y", function(d) { return yAxis(d.key); })
        .attr("width", function(d) { return xAxis(d.value); })
        .attr("height", yAxis.bandwidth() )
        .attr("fill", "blue")

    barChart.append("text")
            .text(selectedData["Movie Title"])
            .style("text-decoration", "underline")
            .attr("transform", "translate(85,-5)")

    
    
    

}

function createBarAxis(xAxis, yAxis) {
    barChart.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(xAxis))
       .selectAll("text")
       .attr("transform", "translate(-10,0)rotate(-45)")
       .style("text-anchor", "end");

    barChart.append("g")
    .call(d3.axisLeft(yAxis))
}


// changes format of data in callback
function dataPreprocessor(row) {
    return {
        'Color': row['color'],
        'Director Name': row['director_name'],
        'Number Critic For Reviews': +row['num_critic_for_reviews'],
        'Duration': +row['duration'],
        'Director Facebook Likes': +row['director_facebook_likes'],
        'Actor 3 Facebook Likes': +row['actor_3_facebook_likes'],
        'Actor 2 Name': row['actor_2_name'],
        'Actor 1 Facebook Likes': +row['actor_1_facebook_likes'],
        'Gross': +row['gross'],
        'Genres': row['genres'],
        'Actor 1 Name': row['actor_1_name'],
        'Movie Title': row['movie_title'],
        'Number of Voted Users': +row['num_voted_users'],
        'Cast Total Facebook Likes': +row['cast_total_facebook_likes'],
        'Actor 3 Name': row['actor_3_name'],
        'Number of Faces in Poster': +row['facenumber_in_poster'],
        'Plot Keywords': row['plot_keywords'],
        'Movie IMDb Link': row['movie_imdb_link'],
        'Number of Users for Reviews': +row['num_user_for_reviews'],
        'Language': row['language'],
        'Country': row['country'],
        'Content Rating': row['content_rating'],
        'Budget': +row['budget'],
        'Title Year': +row['title_year'],
        'Actor 2 Facebook Likes': +row['actor_2_facebook_likes'],
        'IMDb Score': +row['imdb_score'],
        'Aspect Ratio': +row['aspect_ratio'],
        'Movie Facebook Likes': +row['movie_facebook_likes'],
    };
}