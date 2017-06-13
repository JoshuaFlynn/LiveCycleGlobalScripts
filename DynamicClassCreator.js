function StdPairClass(varName1,value1,varName2,value2)
{
	var TempClass = {};
	TempClass[varName1] = value1;
	TempClass[varName2] = value2;
	return TempClass;
}

function IsEven(number)
{
	return number === parseFloat(number)? !(number%2) : void 0;
}

//Must be paired
function DynamicClassCreator()
{
	var arg = Array.prototype.slice.call(arguments);
	
	if(!IsEven(arg.length)){return null;}
	
	var TempObject;
	for(var i = 0;i < arg.length;i=i+2)
	{
		TempObject[arg[i]] = arg[i+1];
	}
	
	return TempObject;
}
