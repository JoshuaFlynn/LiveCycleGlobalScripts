//Keep

//form1.Subform1.Subform2.Line1.resolveNode("value.#line").slope = "/";

//Removes the metric measurement and returns the value
function RemoveMetric(target){ return target.substring(0,target.length - 2); }
//Gets the metric measurement and discards the value
function GetMetric(target){ return target.substring(target.length - 2); }

//Returns a custom temporary object class that splits a metric into two
function GetMetricObject(METRIC)
{
	return {
		"value" : RemoveMetric(METRIC),
		"metric" : GetMetric(METRIC),
		"metricfull" : METRIC
	};
}

//Cascade function that does it's best to get an original height/width value (rather than '0' which is LC's default)
function CascadeHeight(node){ return node.h != "0in" ? node.h : node.minH != "0in" ? node.minH : node.maxH; }
function CascadeWidth(node){ return node.w != "0in" ? node.w : node.minW != "0in" ? node.minW : node.maxW; }

//Create a custom temporary object class that carries a node's height/width (and finds the best possible match if it can)
function GetHeightWidthObject(node)
{
	return {
		"h" : CascadeHeight(node),
		"w" : CascadeWidth(node)
	};
}

//Create a custom temporary object composed of other temporary objects that carry an objects heigth/width in value/metric form
function GetHWMetricObject(node)
{
	return {
		"h" : GetMetricObject(CascadeHeight(node)),
		"w" : GetMetricObject(CascadeWidth(node))
	};
}

function GetXYMetricObject(node)
{
	return {
		"x" : GetMetricObject(node.x),
		"y" : GetMetricObject(node.y)
	};
}

function GetSquareMetricObject(node)
{
	return {
		"h" : GetMetricObject(CascadeHeight(node)),
		"w" : GetMetricObject(CascadeWidth(node)),
		"x" : GetMetricObject(node.x),
		"y" : GetMetricObject(node.y)
	};
}

function GetLineObject(node)
{
	return {
		"node" : node,
		"valuenode" : node.resolveNode("value.#line"),
		"squaremetric" : GetSquareMetricObject(node),
		UpdateSquareMetric : function()
		{
			this.squaremetric = GetSquareMetricObject(node);
		}
	};
}

function GetArrayOfLineObjects(lines)
{
	var Temp = [];
	for(var i = 0;i < lines.length;i++)
	{
		Temp.push(GetLineObject(lines[i]));
	}
	return Temp;
}

function GetLines(rowNode)
{
	var i = 0;
	var quitNow = false;
	var TempLines = [];
	
	while(!quitNow)
	{
		try
		{
			TempLines.push(rowNode.resolveNode("Subform[" + i + "]").Line);	
		}
		catch(err)
		{
			quitNow = true;
			if(err != "TypeError: xfa.resolveNode(...) is null")
			{
				xfa.host.messageBox("Line loop error: " + err);
			}
		}
		i++;
	}
	return TempLines;
}

//ChartObject
function GetChartObject(rowNode)
{
	//Cell metric 
	return {
		refCell : GetSquareMetricObject(rowNode.RefCell),
		lines : GetArrayOfLineObjects(GetLines(rowNode)),
		row : rowNode,
		ResetRowHeight : function()
		{
			this.row.h = this.refCell.h.metricfull;
		},
		SetLineAbs: function(index,XVALUE,YVALUE,WVALUE,HVALUE,METRIC,SLOPE,VISIBILITY,COLOUR)
		{
			var TempMetric = this.lines[index].squaremetric.x.metric;
			
			if(METRIC != undefined && METRIC != null)
			{
				TempMetric = METRIC;
			}
			
			var UpdateSquare = false;
			if(XVALUE != undefined && XVALUE != null){this.lines[index].node.x = XVALUE; UpdateSquare = true;}
			if(YVALUE != undefined && YVALUE != null){this.lines[index].node.y = YVALUE; UpdateSquare = true;}
			if(WVALUE != undefined && WVALUE != null){this.lines[index].node.w = WVALUE; UpdateSquare = true;}
			if(HVALUE != undefined && HVALUE != null){this.lines[index].node.h = HVALUE; UpdateSquare = true;}
			if(VISIBILITY != undefined && VISIBILITY != null){this.lines[index].node.presence = VISIBILITY;}
			if(SLOPE != undefined && SLOPE != null){this.lines[index].valuenode.slope = SLOPE;}
			if(COLOUR != undefined && COLOUR != null){this.lines[index].node.value.line.edge.color.value = COLOUR;}
			if(UpdateSquare)
			{
				this.lines[index].UpdateSquareMetric();
				this.ResetRowHeight();
			}
			
		}
	};
}
