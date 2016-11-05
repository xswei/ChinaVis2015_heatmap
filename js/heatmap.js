var w=1500,h=720;
var svg=d3.select("body").append("svg").attr("width",w).attr("height",h).attr("class","svg").attr("id","svg")
var server,proto,server_proto;
var color_scale=d3.scale.linear()
	.range(["#f6faaa","#9E0142"])
loadfile();
function loadfile(){
	d3.csv("data/server",function(data){
		server=data;
		d3.csv("data/proto",function(dataset){
			proto=dataset;
			d3.csv("data/server_proto_nums",function(s_p){
				server_proto=s_p;
				show_axis();
			})
		})
	})
}
function show_axis(){
	var y_scale_array=[];
	var x_scale_array=[];
	for(var i=0;i<proto.length;++i){
		y_scale_array.push(proto[i].proto);
	}
	for(var i=0;i<server.length;++i){
		x_scale_array.push(server[i].server_ip);
	}
	var y_scale=d3.scale.ordinal()
		.domain(y_scale_array)
		.rangeBands([0,h*2/3])
	var yaxis=d3.svg.axis()
		.scale(y_scale)
		.orient("left")
	svg.append("g").attr("class","yaxis")
		.attr("transform","translate("+(w/6)+","+(h/8)+")")
		.call(yaxis)


	var x_scale=d3.scale.ordinal()
		.domain(x_scale_array)
		.rangeBands([0,w*2/3])
	var xaxis=d3.svg.axis()
		.scale(x_scale)
		.orient("bottom")
	var xaxis=svg.append("g").attr("class","xaxis")
		.attr("transform","translate("+(w/6)+","+(h/8+h*2/3)+")")
		.call(xaxis)
	xaxis.selectAll("text").style("text-anchor","start").attr("transform","translate("+(x_scale.rangeBand()/2+8)+","+8+")rotate("+90+")")
	
	var g_rects=svg.append("g")
		.attr("class","g_rect").attr("transform","translate("+(w/6)+","+(h/8)+")")

	var all_rect=[];
	for(var i=0;i<server.length;++i){
		for(var j=0;j<proto.length;++j){
			all_rect.push({
				"server_ip":server[i].server_ip,
				"proto":proto[j].proto,
				"nums":0
			})
		}
	}
	for(var i=0;i<server_proto.length;++i){
		for(var j=0;j<all_rect.length;++j){
			if(server_proto[i].server_ip==all_rect[j].server_ip&&server_proto[i].proto==all_rect[j].proto){
				all_rect[j].nums+=parseInt(server_proto[i].nums);
				if(all_rect[j].nums>=10000){
					all_rect[j].nums=10000;
				}
				break;
			}
		}
	}

	color_scale.domain([
		d3.min(all_rect,function(d){return d.nums;}),
		d3.max(all_rect,function(d){return d.nums;})
	])
	//color_scale.domain([0,100000])
	g_rects.selectAll("rect")
		.data(all_rect)
		.enter().append("rect")
		.attr("x",function(d){
			return x_scale(d.server_ip);
		})
		.attr("y",function(d){
			return y_scale(d.proto);
		})
		.attr("width",x_scale.rangeBand())
		.attr("height",y_scale.rangeBand())
		.attr("stroke","black")
		.attr("stroke-width",0.2)
		.attr("fill",function(d){
			return color_scale(d.nums);
		})
		.on("mouseover",function(d){
			//console.log(d);
			var temp=d;
			d3.select("g.g_line").remove();
			d3.select("g.g_tip").remove();
			var g_tip=svg.append("g").attr("class","g_tip").attr("transform","translate("+(w/6)+","+(h/8)+")");
			var g_line=svg.append("g").attr("class","g_line").attr("transform","translate("+(w/6)+","+(h/8)+")");
			g_line.append("line")
				.attr("x1",0)
				.attr("y1",function(d){return y_scale(temp.proto);})
				.attr("x2",function(d){return x_scale(temp.server_ip)+x_scale.rangeBand();})
				.attr("y2",function(d){return y_scale(temp.proto);})
				.attr("class","tip_line")
				.attr("stroke-width",3)
				.attr("stroke","#3399ff")
			g_line.append("line")
				.attr("x1",0)
				.attr("y1",function(d){return y_scale(temp.proto)+y_scale.rangeBand();})
				.attr("x2",function(d){return x_scale(temp.server_ip);})
				.attr("y2",function(d){return y_scale(temp.proto)+y_scale.rangeBand();})
				.attr("class","tip_line")
				.attr("stroke-width",3)
				.attr("stroke","#3399ff")
			g_line.append("line")
				.attr("y1",h*2/3)
				.attr("x1",function(d){return x_scale(temp.server_ip);})
				.attr("x2",function(d){return x_scale(temp.server_ip);})
				.attr("y2",function(d){return y_scale(temp.proto)+y_scale.rangeBand();})
				.attr("class","tip_line")
				.attr("stroke-width",3)
				.attr("stroke","#3399ff")
			g_line.append("line")
				.attr("y1",h*2/3)
				.attr("x1",function(d){return x_scale(temp.server_ip)+x_scale.rangeBand();})
				.attr("x2",function(d){return x_scale(temp.server_ip)+x_scale.rangeBand();})
				.attr("y2",function(d){return y_scale(temp.proto);})
				.attr("class","tip_line")
				.attr("stroke-width",3)
				.attr("stroke","#3399ff")
			
			var position = d3.mouse(document.getElementById("svg"));
			g_tip.append("text").attr("x",function(d){
					return x_scale(temp.server_ip)+x_scale.rangeBand();
				}).attr("y",function(d){
					return y_scale(temp.proto);
				})
				.attr("fill","#3399ff")
				.attr("font-size","20px")
				.attr("font-width","bold")
				.text(function(d){
					if(parseInt(temp.nums)==10000){
						return temp.server_ip+"-"+temp.proto+":"+temp.nums+"+";
					}
					return temp.server_ip+"-"+temp.proto+":"+temp.nums;
				})
			
		})
		.on("mouseout",function(d){
			d3.select("g.g_line").remove();
			d3.select("g.g_tip").remove();
		})
		.style("display","none")
		.transition()
		.delay(function(d,i){
			return i*3;
		})
		.style("display","block")
		.attr("class",function(d){
			return "rect_"+d.server_ip.split(".")[0]+"_"+d.server_ip.split(".")[1]+"_"+d.server_ip.split(".")[2]+"_"+d.server_ip.split(".")[3]+"_"+d.proto;
		})

}

