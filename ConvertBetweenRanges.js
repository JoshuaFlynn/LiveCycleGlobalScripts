function ConvertBetweenRanges(FromStart,FromEnd,ToStart,ToEnd,FromValueToConvert)
{
	if(FromStart === FromEnd || ToStart === ToEnd)
	{
		return null;
	}
　
	if(!((FromValueToConvert >= FromStart) && (FromValueToConvert <= FromEnd)) && !((FromValueToConvert >= FromEnd) && (FromValueToConvert <= FromStart)))
	{
		return null;
	}	
　
	//Get range difference between two points (absolute to factor in minus variables)
	var FromTotal = Math.abs(FromStart-FromEnd);	
	
	//Get the absolute value difference
	var Value = Math.abs(FromStart-FromValueToConvert);
	
	//Get number of unit percentages
	var Amount = Math.abs(ToStart-ToEnd)/FromTotal;
	var Total = (FromTotal-Value)*Amount;
		
	if(ToStart > ToEnd)
	{
		return ToStart-Total;
	}
	else
	{
		return ToStart+Total;
	}
}
