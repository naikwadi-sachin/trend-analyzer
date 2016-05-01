package edu.uncc.iv.model;

public class SubTrend {
	private String year;
	private int total;
	
	public SubTrend(String year, int total) {
		super();
		this.year = year;
		this.total = total;
	}

	public int getTotal() {
		return total;
	}

	public void setTotal(int total) {
		this.total = total;
	}

	public String getYear() {
		return year;
	}

	public void setYear(String year) {
		this.year = year;
	}
}
