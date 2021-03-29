// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

// GRAPH 1: bar plot with number of titles per genre
let filenames = ["movies_by_genre.csv", "tv_by_genre.csv"];

let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)     
    .attr("height", graph_1_height)  
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); 

let x = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);

let y = d3.scaleBand()
    .range([0,graph_1_height - margin.top - margin.bottom])
    .padding(0.1); 

let countRef1 = svg1.append("g");

let y_axis_label = svg1.append("g");

svg1.append("text")
    .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${graph_1_height - margin.top - margin.bottom + 10})`)  
    .style("text-anchor", "middle")
    .text("Count");

let y_axis_text = svg1.append("text")
    .attr("transform", `translate(${-140}, ${(graph_1_height - margin.top - margin.bottom) / 2})`)       
    .style("text-anchor", "middle")
    .text('Genre');

let title = svg1.append("text")
    .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)  
    .style("text-anchor", "middle")
    .style("font-size", 15);

function setData(index,attr) {
    d3.csv(filenames[index]).then(function(data) {
    
        let parsed_count = function(a,b) {return (parseInt(b.title) - parseInt(a.title))}; // Base-10
        data = cleanData(data,parsed_count,10);

        x.domain([0, d3.max(data, function(d) { return d.title})]);

        
        y.domain(data.map(function(d) { return d.listed_in }));
       
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));
   
        let bars1 = svg1.selectAll("rect").data(data);

        let color1 = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d.listed_in }))
        .range(d3.quantize(d3.interpolateHcl("#8c74b5", "#9cb3d5"), 10));

        bars1.enter()
            .append("rect")
            .merge(bars1)
            .transition()
            .duration(500)
            .attr("fill", function(d) { return color1(d.listed_in) })
            .attr("x", x(0))
            .attr("y", function(d) {return y(d.listed_in)})              
            .attr("width", function(d) {return x(parseInt(d.title))/2.5})
            .attr("height", y.bandwidth());    

        
        let counts1 = countRef1.selectAll("text").data(data);


        counts1.enter()
            .append("text")
            .merge(counts1)
            .transition()
            .duration(500)
            .attr("x", function(d) {return x(parseInt(d.title))/2.5 +5})       
            .attr("y", function(d) {return y(d.listed_in)+12})      
            .style("text-anchor", "start")
            .style("font-size", 14)
            .text(function(d) {return parseInt(d.title)});        


        title.text(`Number of Titles per ${attr} Genre in Netflix`);

        bars1.exit().remove();
        counts1.exit().remove();
    });
};

function cleanData(data, comparator, numExamples) {
    return data.sort(comparator).slice(0,numExamples)
}
setData(0, "Movies");

// GRAPH 2: average runtime of movies by release year

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr('class', 'charts')
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)  
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); 

let tooltip = d3.select("#graph2") 
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");


d3.csv("duration_by_year.csv").then(function(data){


    let x = d3.scaleTime()
        .domain([Date.parse(data[0].release_year), Date.parse(data[data.length-1].release_year)])
        .range([0, graph_2_width - margin.left - margin.right]);

    let y = d3.scaleLinear()
        .domain([60, d3.max(data, function(d) { return parseInt(d.duration); })])
        .range([0,graph_2_height - margin.top - margin.bottom]);

    let yAxis = d3.scaleLinear()
        .domain([60, d3.max(data, function(d) { return parseInt(d.duration); })])
        .range([graph_2_height - margin.top - margin.bottom,0]);

    svg2.append('g')
        .attr('class', 'x axis')
        .attr("transform", `translate(0, ${graph_2_height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg2.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(yAxis));
    
    let bars2 = svg2.selectAll("rect").data(data);

    let color2 = d3.scaleOrdinal()
        .domain(data.map(function(d) { return parseInt(d.duration) }))
        .range(d3.quantize(d3.interpolateHcl("#9bb9d9","#9bb9d9"), 10));

    let mouseover = function(d) {
        let html = `Year: ${d.release_year}<br/>
                    Avg Movie Length: ${d.duration} mins</span><br/>`;
            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 100}px`)
                .style("top", `${(d3.event.pageY) - 30}px`)
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        };
    let mouseout = function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };
    
        
    bars2.enter()
        .append('rect')
        .attr("fill", function(d) { return color2(d.duration) })
        .attr("x", function(d) {return x(Date.parse(d.release_year))})
        .attr("y", function(d) {return graph_2_height - 80- y(parseInt(d.duration))})
        .attr("width", 7)
        .attr("height", function(d) {return y(parseInt(d.duration))})
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);


    svg2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${graph_2_height - margin.top - margin.bottom + 40})`)   
        .style("text-anchor", "middle")
        .text("Year");

    svg2.append("text")
        .attr("transform", `translate(${-100}, ${(graph_2_height - margin.top - margin.bottom) / 2})`)      
        .style("text-anchor", "middle")
        .text("Average Duration");

    svg2.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-20})`)       
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Average Movie Duration by Release Year");

});

// GRAPH 3: top director & actor pairs for US movies

let svg3 = d3.select("#graph3")
        .append("svg")
        .attr("width", graph_3_width)     
        .attr("height", graph_3_height)  
        .append("g")
        .attr("transform", `translate(${margin.left+120}, ${margin.top})`); 

    
d3.csv('director_actor_pairs.csv').then(function(data) {
        
    let parsed_count = function(a,b) {return (parseInt(b.count) - parseInt(a.count))}; // Base-10
    data = cleanData(data,parsed_count,10);


    let x = d3.scaleLinear()
        .range([0, graph_3_width - margin.left - margin.right])
        .domain([0, d3.max(data, function(d) { return d.count})]);
    
    let y = d3.scaleBand()
        .domain(data.map(function(d) { return d.director_actor }))
        .range([0,graph_3_height - margin.top - margin.bottom])
        .padding(0.1); 
    
    let countRef3 = svg3.append("g");
    
    svg3.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));
    
    svg3.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right -280) / 2}, ${graph_3_height - margin.top - margin.bottom + 25})`)  
        .style("text-anchor", "middle")
        .text("Number of Movies");
    
    svg3.append("text")
        .attr("transform", `translate(${-200}, ${(graph_3_height - margin.top - margin.bottom) / 2})`)       
        .style("text-anchor", "middle")
        .text('Director & Actor');
    
    svg3.append("text")
        .attr("transform", `translate(${(graph_3_width - margin.left - margin.right - 220) / 2}, ${-20})`)  
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text(`Top U.S. Director & Actor Pairs by Number of Movies Together`);

       
    let bars3 = svg3.selectAll("rect").data(data);
    
    let color3 = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d.director_actor }))
            .range(d3.quantize(d3.interpolateHcl("#8c74b5","#9cb3d5"), 10));
    
    bars3.enter()
            .append("rect")
            .merge(bars3)
            .transition()
            .duration(500)
            .attr("fill", function(d) { return color3(d.director_actor) })
            .attr("x", x(0))
            .attr("y", function(d) {return y(d.director_actor)})              
            .attr("width", function(d) {return x(parseInt(d.count))/2.5})
            .attr("height", y.bandwidth());    

            
    let counts3 = countRef3.selectAll("text").data(data);
    
    
    counts3.enter()
            .append("text")
            .merge(counts3)
            .transition()
            .duration(500)
            .attr("x", function(d) {return x(parseInt(d.count))/2.5 +5})       
            .attr("y", function(d) {return y(d.director_actor)+12})      
            .style("text-anchor", "start")
            .style("font-size", 14)
            .text(function(d) {return parseInt(d.count)});        
    
});
