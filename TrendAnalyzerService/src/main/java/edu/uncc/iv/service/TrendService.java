package edu.uncc.iv.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Service;

import edu.uncc.iv.model.Categories;
import edu.uncc.iv.model.MonthCountry;
import edu.uncc.iv.model.SubTrend;
import edu.uncc.iv.model.Trend;

@Service
public class TrendService {

	@Autowired
	private DataSource dataSource;

	String GET_CATG_TRENDS_SQL = "select root_cat cat ,MonthDate Monthd , DATE_FORMAT(MonthDate, '%M-%Y') as MonthYear,  count(1) as CustTotal , "
			+ "sum(Quantity * UnitPrice) as SalesTotal, "
			+ "(select count(distinct description) from test.sales s where s.root_cat=cat and s.MonthDate=Monthd) as product_count "
			+ "from test.sales where root_cat is not null group by root_cat,MonthDate";

	String GET_CATEGORIES_SQL = "select distinct root_cat from test.sales where root_cat is not null;";

	String GET_COUNTRYWISE_SQL = "select country,root_cat, DATE_FORMAT(MonthDate, '%M-%Y') as MonthYear, sum(Quantity * UnitPrice) as SalesTotal "
			+ "from test.sales where root_cat is not null group by country,root_cat,MonthDate "
			+ " -- order by country desc ;";

	public List<Trend> getCatWiseSalesAmtAndCustomers() {
		List<Trend> trends = new ArrayList<Trend>();

		try {
			if (dataSource.getConnection() != null)
				System.out.println("found db connection");
			else
				System.out.println("db connection is null");
		} catch (Exception e) {
			e.printStackTrace();
		}

		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

		try {

			SqlRowSet rows = jdbcTemplate.queryForRowSet(GET_CATG_TRENDS_SQL,
					new Object[] {});

			if (rows.first()) {
				HashMap<String, Trend> map = new HashMap<String, Trend>();
				do {
					String cat = rows.getString("cat");
					Trend trend = null;
					if (map.containsKey(cat)) {
						trend = map.get(cat);
					} else {
						trend = new Trend();
						trend.setCategoryName(cat);
						map.put(cat, trend);
					}

					String month = rows.getString("MonthYear");
					int salesTotal = (int) rows.getDouble("SalesTotal");
					int custTotal = rows.getInt("CustTotal");
					int productTotal = rows.getInt("product_count");

					ArrayList salesTrend = new ArrayList();
					salesTrend.add(month);
					salesTrend.add(salesTotal);

					ArrayList custTrend = new ArrayList();
					custTrend.add(month);
					custTrend.add(custTotal);

					ArrayList productTrend = new ArrayList();
					productTrend.add(month);
					productTrend.add(productTotal);

					trend.getSales().add(salesTrend);
					trend.getProducts().add(productTrend);
					trend.getCustomers().add(custTrend);

				} while (rows.next());

				System.out.println(map);

				for (String cat : map.keySet()) {
					trends.add(map.get(cat));
				}
				map = null;
			}

		} catch (DataAccessException dae) {
			dae.printStackTrace();
		}
		return trends;
	}

	public List<MonthCountry> getCountrywiseiseSalesAmt() {
		ArrayList<MonthCountry> monthList = new ArrayList<MonthCountry>();

		try {
			if (dataSource.getConnection() != null)
				System.out.println("found db connection");
			else
				System.out.println("db connection is null");
		} catch (Exception e) {
			e.printStackTrace();
		}

		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

		try {

			SqlRowSet rows = jdbcTemplate.queryForRowSet(GET_COUNTRYWISE_SQL,
					new Object[] {});

			if (rows.first()) {
				HashMap<String, HashMap<String, Categories>> monthsMap = new HashMap<String, HashMap<String, Categories>>();
				do {
					String monthYear = rows.getString("MonthYear");
					String country = rows.getString("country");
					String cat = rows.getString("root_cat");
					double salesTotal = rows.getDouble("SalesTotal");
					HashMap<String, Categories> countriesMap = null;
					if (monthsMap.containsKey(monthYear)) {
						countriesMap = monthsMap.get(monthYear);
					} else {
						countriesMap = new HashMap<String, Categories>();
						monthsMap.put(monthYear, countriesMap);
					}
					Categories categories = null;
					if (countriesMap.containsKey(country)) {
						categories = countriesMap.get(country);
					} else {
						categories = new Categories();
						countriesMap.put(country, categories);
					}
					categories.country = country;

					if ("Artwork".equals(cat)) {
						categories.artwork += salesTotal;
					} else if ("Bathroom Accessories".equals(cat)) {
						categories.bathAccessories += salesTotal;
					} else if ("Books & Stationery".equals(cat)) {
						categories.bookStationary += salesTotal;
					} else if ("Electronics".equals(cat)) {
						categories.electronics += salesTotal;
					} else if ("Gifts".equals(cat)) {
						categories.gifts += salesTotal;
					} else if ("Health and Personal care".equals(cat)) {
						categories.health += salesTotal;
					} else if ("Home Decor".equals(cat)) {
						categories.homeDecor += salesTotal;
					}

				} while (rows.next());

				System.out.println(monthsMap);

				
				for(String month :monthsMap.keySet()){
					ArrayList<Categories> countryList = new ArrayList<Categories>();
					for(String country :monthsMap.get(month).keySet()){
						countryList.add(monthsMap.get(month).get(country));
					}
					MonthCountry obj = new MonthCountry();
					obj.month = month;
					obj.countryList = countryList;
					monthList.add(obj);
				}
			}

		} catch (DataAccessException dae) {
			dae.printStackTrace();
		}
		return monthList;
	}

	public List<String> getCategories() {
		List<String> categories = new ArrayList<String>();
		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

		try {
			SqlRowSet rows = jdbcTemplate.queryForRowSet(GET_CATEGORIES_SQL,
					new Object[] {});
			if (rows.first()) {
				do {
					categories.add(rows.getString("root_cat"));
				} while (rows.next());
			}
		} catch (DataAccessException dae) {
			dae.printStackTrace();
		}
		System.out.println(categories);
		return categories;
	}

}
