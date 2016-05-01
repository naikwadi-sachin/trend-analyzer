package edu.uncc.iv.model;

import java.util.ArrayList;

public class Trend {

	private String categoryName;
	private ArrayList<ArrayList> sales = new ArrayList<ArrayList>();
	private ArrayList<ArrayList> customers = new ArrayList<ArrayList>();
	private ArrayList<ArrayList> products = new ArrayList<ArrayList>();

	public String getCategoryName() {
		return categoryName;
	}
	
	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public ArrayList<ArrayList> getCustomers() {
		return customers;
	}

	public ArrayList<ArrayList> getSales() {
		return sales;
	}

	public ArrayList<ArrayList> getProducts() {
		return products;
	}

}

