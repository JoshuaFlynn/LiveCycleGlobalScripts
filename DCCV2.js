function IsEven(number)
{
	return number === parseFloat(number)? !(number%2) : void 0;
}

function IsAnArray(anArray)
{
	return (anArray != undefined && anArray != null && anArray.length > 0);
}

//Must be paired for 'append' mode
//Stands for Dynamic Class Creator
//remove is optional
function DCCArrModify(tempObject,argstoappend,argstoremove)
{
	var tempObjectCopy = tempObject;
	if(IsAnArray(argstoappend))
	{
		if(IsEven(arg.length))
		{
			for(var i = 0;i < argstoappend.length;i=i+2)
			{
				tempObjectCopy[arg[i]] = arg[i+1];
			}
		}
	}
		
	if(IsAnArray(argstoremove))
	{
		for(var i = 0;i < argstoremove.length;i++)
		{
			delete tempObjectCopy[arg[i]];
		}
	}
	
	return tempObjectCopy;
}

function DCCArr(arg,arg2){ return DCCArrModify({},arg,arg2); }
function DCC(){ return DCCArr(Array.prototype.slice.call(arguments)); }
