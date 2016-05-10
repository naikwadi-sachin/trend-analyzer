package edu.uncc.iv.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import edu.uncc.iv.model.MonthCountry;
import edu.uncc.iv.model.Trend;
import edu.uncc.iv.service.TrendService;

@Controller
public class TrendController {

	@Autowired
	private TrendService trendService;
	
	@RequestMapping("/")
	@ResponseBody
	public String hello()
	{
		return "Service started running on port 9195";
	}
	
	@RequestMapping("/getCatWiseSalesAmtAndCustomers")
	@ResponseBody
    public List<Trend> getCatWiseSalesAmtAndCustomers()
    {
        return trendService.getCatWiseSalesAmtAndCustomers();
    }
	
	@RequestMapping("/getCategories")
	@ResponseBody
    public List<String> getCategories()
    {
        return trendService.getCategories();
    }
	
	@RequestMapping("/getCountryWiseSalesAmtAndCustomers")
	@ResponseBody
    public List<MonthCountry> getCountryWiseSalesAmtAndCustomers()
    {
        return trendService.getCountrywiseiseSalesAmt();
    }
	
}
