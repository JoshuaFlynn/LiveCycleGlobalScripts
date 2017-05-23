function IsAnArray(anArray)
{
	return (anArray != undefined && anArray != null && anArray.length > 0);
}

//Takes an array of arrays and flattens it
function Flatten(oArray)
{
	var tempoArray = [];
	for(var ioA = 0;ioA < oArray.length;ioA++)
	{
		//if is an array
		
		if(IsAnArray(oArray[ioA]))
		{
			for(var oAi = 0; oAi < oArray[i].length;oAi++)
			{
				tempoArray.push(oArray[ioA][oAi]);
			}
		}
	}
	
	return tempoArray;
}

function DeepCopy(o)
{
   var output, v, key;
   output = IsAnArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? copy(v) : v;
   }
   return output;
}

function ConvertObjectListToName(arrayObjectList)
{
	if(!IsAnArray(arrayObjectList))
	{
		return null;
	}
	
	var tempname = "";
	
	for(var iCOL = 0; iCOL < arrayObjectList.length;iCOL++)
	{
		//console.println(" "+arrayObjectList[iCOL]);
		tempname = tempname + arrayObjectList[iCOL].name + ".";
	}
	return tempname;
}

function GetParentsObjectsList(node,start,end)
{
	var loopNode = node;
	var exitLoop = false;
	var objectArray = [];
	var iterLevel = 0;
	
	objectArray.unshift(node);
	
	//We trade our code footprint off to improve performance. Rather than constantly checking level
	//We check it once and split on loop type.
	
	do
	{
		try
		{
			loopNode = loopNode.parent;
		}
		catch(err)
		{
			console.println("Parent try exit not full: Error: " + err.message + ". Exit on iter: " + iterLevel);
			exitLoop = true;
		}
		
		if(!exitLoop)
		{
			if(loopNode != null)
			{
				//Unshift pushes the item in-front, rather than behind, as we're climbing the parent list in reverse
				objectArray.unshift(loopNode);
			}
			else
			{
				exitLoop = true;
			}
		}
	}
	while(!exitLoop);
			
	var endLen = 0;
	
	
	if(end == "Full")
	{
		endLen = objectArray.length - 2;
	}
	else if(end < objectArray.length)
	{
		endLen = end;
	}
	else
	{
		//Covers all other case scenarios, include FullXFA, end bigger than actual length
		endLen = objectArray.length;
	}
	
	var startLen = 0;
	if(start <= endLen && start >= 0)
	{
		startLen = start;
	}
	else if(start > endLen)
	{
		start = endLen;	
	}
	else
	{
		//This also covers if start is less than 0
		startLen = 0;
	}
	
	if(startLen > objectArray.length || endLen > objectArray.length)
	{
		console.println("Error, length mismatch: startLen: " + startLen + ". endLen: " + endLen + ". objectArray.length: " + objectArray.length);
		return null;
	}

	//We have to reverse this because of how XFA referencing works. 
	return objectArray.slice(objectArray.length-endLen,objectArray.length-startLen);
}

function GetChildrenObjectsList(node,underscorehandling,excludename)
{
	var children = [];
	var iter = 0;
	var tempObject = null;
	var quitLoop = false;
	var dudValue;
	
	do
	{
		try
		{
			tempObject = node.nodes.item(iter);
		}
		catch(err)
		{
			console.println("Error: " + err.message + " on iteration: " + iter);
			quitLoop = true;
		}
		
		if(!quitLoop)
		{
			if(((excludename == null) || ((excludename != null) && (excludename != tempObject.name))))
			{
				if(underscorehandling == "All")
				{
					children.push(tempObject);
				}
				else if(underscorehandling == "IgnoreUnderscore")
				{
					if(!(tempObject.name.indexOf("_") > -1))
					{
						children.push(tempObject);
					}
				}
				else if(underscorehandling == "IgnoreNonUnderscore")
				{
					if((tempObject.name.indexOf("_") > -1))
					{
						children.push(tempObject);
					}
				}
				else
				{
					console.println(underscorehandling+" is not recognised.");
				}
			}
		}
		
		iter++;
	}
	while(!quitLoop);
	
	return children;
}

//Arg[0] = Reserved for node
//Arg[1] = Mode [Get or Set]
//Arg[2] = Target [Child, Sibling, Parent, Parents, Siblings, Children]
//Arg[3] = Num [Ignored for Children/Siblings. For Child/Sibling, gets the child at that position.
//For parent, gets the parent whose level is X above the calling node. For parents, gets the parents above]
//Arg[4] = Type [Get only: Object/Name. Get/Set: rawValue]
//Arg[5] = As [Array or Merged. Merged is ignored if it cannot be merged.]
//Arg[6] = Reference Level [Which can be any 0 or higher number, or the word -
//- "Full" (excludes XFA overhead on parents) or "FullXFA" (includes XFA on parent overhead). Ignored in the case of child/sibling calls]
//This tells the program how high up to go to get references (EG 1 would be 'get the immediate parent name')
//Arg[7] = Underscore named variable handling [IgnoreUnderscore, IgnoreNonUnderscore, All]
//Arg[8] = 'Optional' [Mandatory for Set] - if a set operation is called, this is the variable they must be set with.
//If a singular variable, all rawValue types will be set to it.
//If an array, the array length must match the number of variables
function FamilyVariadicFunction(node)
{
	var arg = Array.prototype.slice.call(arguments);
	
	console.println("Node: " + node + ". arg[0] " + arg[0]);
	
	if(!((arg[1] == "Get") && (arg.length >= 8)) && !((arg[1] == "Set") && (arg.length >= 9) && (arg[4] != "rawValue")))
	{
		console.println("Error in FamilyVariadicFunction: insufficient number of arguments supplied, or incorrect method type called. Arg[1]: " + arg[1] + ". arg len: " + arg.length);
		return null;
	}
	
	//Our workHorse variable stores all the details we'll need to complete our tasks
	var workHorse = [];
	

	if(arg[2].indexOf("Parent") > -1)
	{
		//Get all the parent objects up to the level specified
		workHorse[0] = GetParentsObjectsList(node,arg[3],arg[6]);
	}
	else
	{
		workHorse[0] = null;
	}
	

	if(arg[2].indexOf("Child") > -1)
	{
		//Get all the child objects for referencing, factoring in underscore handling
		//null is just for the 'exclude name' used by the sibling call
		workHorse[1] = GetChildrenObjectsList(node,arg[7],null);
	}
	else
	{
		workHorse[1] = null;
	}
	
	if(arg[2].indexOf("Sibling") > -1)
	{
		//Get all the sibling objects for referencing (excluding ourselves), factoring in underscore handling
		workHorse[2] = GetChildrenObjectsList(node.parent,arg[7],node.name);
	}
	else
	{
		workHorse[2] = null;
	}
	
	//Check workHorse has something we can process
	
	if(!IsAnArray(workHorse))
	{
		console.println("FamilyVariadicFunction: workHorse has no contents to work on (did you specify any valid targets?).");
		return null;
	}
	
	console.println("Get pre-load work");
	
	if(arg[1] == "Get")
	{
		
		//Do the bulk of processing or conversion work if it's a non-object.
		if((arg[4] == "Name") || (arg[4] == "rawValue"))
		{
			var convertArray = [];
			var tempArray;
			
			var iterWH = 0;
			for(var i = 0;i < workHorse.length;i++)
			{
				//Check array exists before trying to work on it
				if(IsAnArray(workHorse[i]))
				{
					iterWH = 0;
					tempArray = [];
					while(iterWH < workHorse[i].length)
					{
						//Returns a node like object
						//ConvertObjectListToName
						if(arg[4] == "Name")
						{
							tempArray.push(ConvertObjectListToName(GetParentsObjectsList(workHorse[i][iterWH],0,arg[6])));
							console.println("Name"+i+" "+iterWH+" "+tempArray[tempArray.length-1]);
						}
						else if(arg[4] == "rawValue")
						{
							tempArray.push(workHorse[i][iterWH].rawValue);
						}
						iterWH++;
					}
					convertArray = DeepCopy(tempArray);
				}
			}
			workHorse = convertArray;
		}
		
		console.println("Work order calculation");
		
		var splitOrder = arg[2].split("|");
	
		var Output = [];
		var tempOutput;
		
		for(var iter = 0;iter < splitOrder.length;iter++)
		{
			tempOutput = [];
			//Order of workhorse array access is:
			//0 for parent
			//1 for child
			//2 for sibling
			if(splitOrder[iter] == "Child")
			{
				Output.push(workHorse[1][arg[3]]);
			}
			else if(splitOrder[iter] == "Sibling")
			{
				Output.push(workHorse[2][arg[3]]);
			}
			else if(splitOrder[iter] == "Parent")
			{
				Output.push(workHorse[0][arg[3]]);
			}
			else if(splitOrder[iter] == "Parents")
			{
				Output.push(DeepCopy(workHorse[0]));
			}
			else if(splitOrder[iter] == "Children")
			{
				Output.push(DeepCopy(workHorse[1]));
			}
			else if(splitOrder[iter] == "Siblings")
			{
				Output.push(DeepCopy(workHorse[2]));
			}
		}
		
		return Output;
	
	}
	else if(arg[1] == "Set")
	{
	
	}
	return null;
}
