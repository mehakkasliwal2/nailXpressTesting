import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Camera, Save, Plus, Trash2, Instagram, Phone, Mail, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ArtistProfileSetup = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Function to get cities based on selected state
  const getCitiesForState = (state) => {
    const citiesByState = {
      'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn', 'Decatur', 'Madison', 'Florence', 'Gadsden', 'Vestavia Hills', 'Prattville', 'Phenix City', 'Opelika', 'Bessemer', 'Prichard', 'Enterprise', 'Homewood'],
      'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai', 'Kodiak', 'Bethel', 'Palmer', 'Homer', 'Barrow', 'Nome', 'Kotzebue', 'Seward', 'Valdez', 'Cordova', 'Dillingham', 'Unalaska', 'Wrangell'],
      'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise', 'Yuma', 'Avondale', 'Goodyear', 'Flagstaff', 'Buckeye', 'Lake Havasu City', 'Casa Grande', 'Sierra Vista', 'Maricopa', 'Oro Valley'],
      'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'North Little Rock', 'Conway', 'Rogers', 'Pine Bluff', 'Bentonville', 'Hot Springs', 'Texarkana', 'Russellville', 'Batesville', 'Paragould', 'Cabot', 'Searcy', 'Van Buren', 'El Dorado', 'Blytheville'],
      'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Chula Vista', 'Fremont', 'San Bernardino', 'Modesto', 'Fontana', 'Oxnard', 'Moreno Valley', 'Huntington Beach', 'Glendale', 'Santa Clarita', 'Garden Grove', 'Oceanside', 'Rancho Cucamonga', 'Santa Rosa', 'Ontario', 'Lancaster', 'Elk Grove', 'Corona', 'Palmdale', 'Salinas', 'Pomona', 'Hayward', 'Escondido', 'Torrance', 'Sunnyvale', 'Orange', 'Fullerton', 'Pasadena', 'Thousand Oaks', 'Visalia', 'Simi Valley', 'Concord', 'Roseville', 'Santa Clara', 'Vallejo', 'Victorville'],
      'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Westminster', 'Arvada', 'Pueblo', 'Centennial', 'Boulder', 'Greeley', 'Longmont', 'Loveland', 'Grand Junction', 'Broomfield', 'Northglenn', 'Commerce City', 'Parker', 'Lafayette'],
      'CT': ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich', 'Hamden', 'Meriden', 'Bristol', 'Manchester', 'West Haven', 'Milford', 'Stratford', 'East Hartford', 'Middletown', 'Norwich'],
      'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford', 'Seaford', 'Georgetown', 'Elsmere', 'New Castle', 'Laurel', 'Harrington', 'Lewes', 'Milton', 'Rehoboth Beach', 'Bethany Beach', 'Dewey Beach', 'Fenwick Island', 'South Bethany', 'Henlopen Acres'],
      'FL': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Fort Lauderdale', 'Port St. Lucie', 'Cape Coral', 'Pembroke Pines', 'Hollywood', 'Miramar', 'Gainesville', 'Coral Springs', 'Miami Gardens', 'Clearwater', 'Palm Bay', 'West Palm Beach', 'Pompano Beach', 'Lakeland', 'Davie', 'Miami Beach', 'Sunrise', 'Plantation', 'Boca Raton', 'Deltona', 'Largo', 'Deerfield Beach', 'Boynton Beach', 'Lauderhill', 'Weston', 'Fort Myers', 'Kissimmee', 'Homestead', 'Tamarac', 'Delray Beach', 'Daytona Beach', 'North Miami', 'Wellington', 'Jupiter', 'Ocala', 'Port Orange', 'Margate', 'Coconut Creek', 'Sanford', 'Sarasota', 'Pensacola', 'Palm Coast', 'Pinellas Park'],
      'GA': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Macon', 'Albany', 'Johns Creek', 'Warner Robins', 'Alpharetta', 'Marietta', 'Valdosta', 'Smyrna', 'Dunwoody', 'Rome', 'East Point', 'Peachtree Corners', 'Peachtree City', 'Gainesville', 'Hinesville', 'Dalton', 'Kennesaw', 'LaGrange', 'Statesboro', 'Carrollton', 'Griffin', 'Thomasville', 'Decatur', 'Cartersville', 'Pooler', 'Tifton', 'Americus', 'Cordele', 'Waycross', 'Moultrie', 'Bainbridge', 'Douglas', 'Fitzgerald', 'Jesup', 'Monroe', 'Perry', 'Swainsboro', 'Vidalia', 'Winder', 'Woodstock', 'Acworth', 'Buford', 'Canton'],
      'HI': ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Kaneohe', 'Waipahu', 'Kailua-Kona', 'Kahului', 'Kihei', 'Ewa Beach', 'Mililani', 'Kailua', 'Kaneohe', 'Waipahu', 'Kailua-Kona', 'Kahului', 'Kihei', 'Ewa Beach', 'Mililani', 'Kailua'],
      'ID': ['Boise', 'Nampa', 'Meridian', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene', 'Twin Falls', 'Lewiston', 'Post Falls', 'Rexburg', 'Eagle', 'Chubbuck', 'Ammon', 'Hayden', 'Mountain Home', 'Blackfoot', 'Garden City', 'Jerome', 'Sandpoint'],
      'IL': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin', 'Waukegan', 'Cicero', 'Champaign', 'Bloomington', 'Arlington Heights', 'Evanston', 'Decatur', 'Schaumburg', 'Bolingbrook', 'Palatine', 'Skokie', 'Des Plaines', 'Orland Park', 'Tinley Park', 'Oak Lawn', 'Berwyn', 'Mount Prospect', 'Normal', 'Wheaton', 'Hoffman Estates', 'Oak Park', 'Downers Grove', 'Elmhurst', 'Glenview', 'Lombard', 'Buffalo Grove', 'Bartlett', 'Urbana', 'Quincy', 'Crystal Lake', 'Streamwood', 'Carol Stream', 'Hanover Park', 'Carpentersville', 'Wheeling', 'Park Ridge', 'Addison', 'Calumet City', 'Northbrook', 'St. Charles', 'Belleville', 'Woodridge'],
      'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary', 'Muncie', 'Lafayette', 'Terre Haute', 'Kokomo', 'Anderson', 'Noblesville', 'Greenwood', 'Elkhart', 'Mishawaka', 'Lawrence', 'Jeffersonville'],
      'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Council Bluffs', 'Ames', 'West Des Moines', 'Dubuque', 'Ankeny', 'Urbandale', 'Cedar Falls', 'Marion', 'Bettendorf', 'Mason City', 'Marshalltown', 'Burlington', 'Ottumwa', 'Fort Dodge'],
      'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina', 'Hutchinson', 'Leavenworth', 'Leawood', 'Dodge City', 'Garden City', 'Emporia', 'Derby', 'Prairie Village', 'Hays', 'Pittsburg'],
      'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Hopkinsville', 'Richmond', 'Henderson', 'Elizabethtown', 'Paducah', 'Jeffersontown', 'Frankfort', 'Nicholasville', 'Georgetown', 'Madisonville', 'St. Matthews', 'Shively', 'Newport', 'Fort Thomas', 'Radcliff'],
      'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe', 'Alexandria', 'Houma', 'Central', 'Ruston', 'Sulphur', 'Slidell', 'Pineville', 'Natchitoches', 'Hammond', 'Opelousas', 'Thibodaux', 'Gretna'],
      'ME': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford', 'Sanford', 'Saco', 'Augusta', 'Westbrook', 'Waterville', 'Gorham', 'Yarmouth', 'Cape Elizabeth', 'Falmouth', 'Scarborough', 'Windham', 'Bath', 'Brewer', 'Caribou'],
      'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg', 'Bowie', 'Hagerstown', 'Annapolis', 'College Park', 'Salisbury', 'Laurel', 'Greenbelt', 'Cumberland', 'Westminster', 'Hyattsville', 'Takoma Park', 'Easton', 'Elkton', 'Aberdeen', 'Havre de Grace', 'Cambridge'],
      'MA': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'New Bedford', 'Quincy', 'Lynn', 'Newton', 'Lawrence', 'Somerville', 'Framingham', 'Haverhill', 'Waltham', 'Malden', 'Brookline', 'Plymouth', 'Medford', 'Taunton'],
      'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing', 'Ann Arbor', 'Flint', 'Dearborn', 'Livonia', 'Westland', 'Troy', 'Farmington Hills', 'Kalamazoo', 'Wyoming', 'Southfield', 'Rochester Hills', 'Taylor', 'Pontiac', 'St. Clair Shores', 'Royal Oak', 'Novi', 'Dearborn Heights', 'Battle Creek', 'Saginaw', 'Kentwood', 'East Lansing', 'Roseville', 'Portage', 'Midland', 'Lincoln Park', 'Bay City', 'Muskegon', 'Holland', 'Wyandotte', 'Allen Park', 'Madison Heights', 'Oak Park', 'Southgate', 'Riverview', 'Garden City', 'Berkley', 'Hazel Park', 'Inkster', 'Hamtramck', 'Highland Park', 'Ecorse', 'River Rouge', 'Grosse Pointe Woods', 'Grosse Pointe Park', 'Grosse Pointe'],
      'MN': ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'St. Cloud', 'Eagan', 'Woodbury', 'Maple Grove', 'Eden Prairie', 'Minnetonka', 'Burnsville', 'Lakeville', 'Blaine', 'Richfield', 'Brooklyn Center', 'Coon Rapids', 'Shoreview'],
      'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo', 'Greenville', 'Olive Branch', 'Horn Lake', 'Clinton', 'Madison', 'Pearl', 'Ridgeland', 'Starkville', 'Columbus', 'Vicksburg', 'Pascagoula', 'Natchez', 'Ocean Springs'],
      'MO': ['Kansas City', 'Saint Louis', 'Springfield', 'Independence', 'Columbia', 'Lee\'s Summit', 'O\'Fallon', 'St. Joseph', 'St. Charles', 'St. Peters', 'Blue Springs', 'Florissant', 'Joplin', 'Chesterfield', 'Jefferson City', 'Cape Girardeau', 'Oakville', 'Wildwood', 'University City', 'Ballwin'],
      'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell', 'Havre', 'Anaconda', 'Miles City', 'Belgrade', 'Livingston', 'Laurel', 'Whitefish', 'Lewistown', 'Sidney', 'Glendive', 'Hamilton', 'Dillon', 'Polson'],
      'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Hastings', 'North Platte', 'Norfolk', 'Columbus', 'Papillion', 'La Vista', 'Scottsbluff', 'South Sioux City', 'Beatrice', 'Gering', 'Alliance', 'McCook', 'York', 'Chalco'],
      'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Fernley', 'Elko', 'Mesquite', 'Boulder City', 'Fallon', 'Winnemucca', 'West Wendover', 'Ely', 'Yerington', 'Lovelock', 'Caliente', 'Wells', 'Carlin', 'Jackpot'],
      'NH': ['Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester', 'Dover', 'Goffstown', 'Laconia', 'Hampton', 'Keene', 'Portsmouth', 'Hudson', 'Londonderry', 'Merrimack', 'Bedford', 'Goffstown', 'Exeter', 'Durham', 'Barrington', 'Windham'],
      'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Hamilton', 'Trenton', 'Clifton', 'Camden', 'Brick', 'Cherry Hill', 'Passaic', 'Union City', 'Old Bridge', 'Middletown', 'Franklin', 'Bayonne'],
      'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington', 'Clovis', 'Hobbs', 'Alamogordo', 'Carlsbad', 'Gallup', 'Deming', 'Los Lunas', 'Chaparral', 'Sunland Park', 'Las Vegas', 'North Valley', 'South Valley', 'Paradise Hills', 'Los Ranchos'],
      'NY': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Hempstead', 'Troy', 'Niagara Falls', 'Binghamton', 'Freeport', 'Valley Stream', 'Long Beach', 'Rome', 'Ithaca', 'Poughkeepsie', 'Levittown', 'Watertown', 'Elmira', 'Middletown', 'Auburn', 'Glen Cove', 'Cortland', 'Batavia', 'Oswego', 'Oneonta', 'Plattsburgh', 'Glens Falls', 'Beacon', 'Hornell', 'Lockport', 'Malone', 'Massapequa', 'Mineola', 'Newburgh', 'Olean', 'Peekskill', 'Port Chester', 'Saratoga Springs', 'Tonawanda', 'Watervliet', 'Westbury', 'White Plains', 'Yonkers'],
      'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Concord', 'Asheville', 'Gastonia', 'Jacksonville', 'Chapel Hill', 'Rocky Mount', 'Burlington', 'Wilson', 'Huntersville', 'Kannapolis', 'Apex', 'Hickory', 'Goldsboro', 'Greenville', 'Salisbury', 'Monroe', 'Mooresville', 'New Bern', 'Sanford', 'Statesville', 'Matthews', 'Thomasville', 'Cornelius', 'Mint Hill', 'Kernersville', 'Morganton', 'Lumberton', 'Lenoir', 'Shelby', 'Clemmons', 'Lexington', 'Pineville', 'Albemarle', 'Mount Airy', 'Mebane', 'Henderson', 'Laurinburg', 'Boone', 'Reidsville', 'Tarboro', 'Kings Mountain'],
      'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Williston', 'Dickinson', 'Mandan', 'Jamestown', 'Wahpeton', 'Devils Lake', 'Valley City', 'Grafton', 'Beulah', 'Rugby', 'New Town', 'Stanley', 'Cavalier', 'Harvey', 'Carrington'],
      'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown', 'Lorain', 'Hamilton', 'Springfield', 'Kettering', 'Elyria', 'Lakewood', 'Cuyahoga Falls', 'Middletown', 'Euclid', 'Newark', 'Mansfield', 'Mentor', 'Beavercreek', 'Cleveland Heights', 'Strongsville', 'Fairborn', 'Findlay', 'Warren', 'Lancaster', 'Lima', 'Huber Heights', 'Westerville', 'Marion', 'Grove City', 'Stow', 'Delaware', 'Bellefontaine', 'Green', 'Berea', 'Massillon', 'Kent', 'Sandusky', 'Barberton', 'Zanesville', 'Upper Arlington', 'Mentor-on-the-Lake', 'Gahanna', 'Reynoldsburg', 'Pickerington', 'Troy', 'New Carlisle'],
      'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton', 'Edmond', 'Moore', 'Midwest City', 'Enid', 'Stillwater', 'Muskogee', 'Bartlesville', 'Owasso', 'Ponca City', 'Shawnee', 'Bixby', 'Jenks', 'Ardmore', 'McAlester', 'Duncan'],
      'OR': ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro', 'Bend', 'Beaverton', 'Medford', 'Springfield', 'Corvallis', 'Albany', 'Tigard', 'Lake Oswego', 'Keizer', 'Grants Pass', 'Oregon City', 'McMinnville', 'Redmond', 'Tualatin', 'West Linn'],
      'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'Altoona', 'York', 'State College', 'Wilkes-Barre', 'Chester', 'Williamsport', 'Easton', 'Lebanon', 'Johnstown', 'New Castle', 'McKeesport', 'Norristown', 'New Kensington', 'Coatesville', 'Butler', 'Monroeville', 'Chambersburg', 'Phoenixville', 'West Chester', 'Greensburg', 'Pottstown', 'Sharon', 'Washington', 'Beaver Falls', 'Uniontown', 'Lansdale', 'Gettysburg', 'Meadville', 'Corry', 'Oil City', 'Franklin', 'Warren', 'DuBois', 'Indiana', 'Kittanning', 'Titusville', 'Bradford', 'Waynesburg', 'Connellsville', 'Jeannette', 'Hermitage'],
      'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport', 'Central Falls', 'Westerly', 'Cumberland', 'North Providence', 'South Kingstown', 'Johnston', 'North Smithfield', 'Lincoln', 'Bristol', 'Smithfield', 'Barrington', 'Middletown', 'Portsmouth'],
      'SC': ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville', 'Sumter', 'Hilton Head Island', 'Spartanburg', 'Florence', 'Greenwood', 'Aiken', 'Anderson', 'Greer', 'Myrtle Beach', 'Taylors', 'Goose Creek', 'Hanahan', 'Simpsonville'],
      'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton', 'Pierre', 'Huron', 'Vermillion', 'Spearfish', 'Madison', 'Sturgis', 'Lead', 'Belle Fourche', 'Hot Springs', 'Canton', 'Milbank', 'Sisseton', 'Winner'],
      'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Hendersonville', 'Kingsport', 'Collierville', 'Smyrna', 'Brentwood', 'Bartlett', 'Germantown', 'Spring Hill', 'Columbia', 'La Vergne', 'Gallatin'],
      'TX': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'Pasadena', 'Mesquite', 'McKinney', 'McAllen', 'Killeen', 'Frisco', 'Waco', 'Carrollton', 'Pearland', 'Midland', 'Denton', 'Abilene', 'Round Rock', 'Richardson', 'Odessa', 'Tyler', 'Lewisville', 'College Station', 'San Angelo', 'Allen', 'Sugar Land', 'Longview', 'Edinburg', 'Bryan', 'Pharr', 'Baytown', 'Missouri City', 'Flower Mound', 'New Braunfels', 'Cedar Park', 'Harlingen', 'Georgetown', 'Pflugerville', 'Port Arthur'],
      'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George', 'Layton', 'Taylorsville', 'Millcreek', 'Lehi', 'South Jordan', 'Riverton', 'Roy', 'Draper', 'Murray', 'Spanish Fork', 'Pleasant Grove', 'Cottonwood Heights'],
      'VT': ['Burlington', 'Essex', 'South Burlington', 'Colchester', 'Rutland', 'Montpelier', 'Barre', 'St. Albans', 'Brattleboro', 'Milton', 'Hartford', 'Williston', 'Middlebury', 'Bennington', 'Shelburne', 'Springfield', 'Randolph', 'Swanton', 'Winooski', 'Northfield'],
      'VA': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Portsmouth', 'Suffolk', 'Roanoke', 'Lynchburg', 'Harrisonburg', 'Leesburg', 'Charlottesville', 'Danville', 'Blacksburg', 'Manassas', 'Petersburg', 'Fredericksburg', 'Winchester'],
      'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Everett', 'Spokane Valley', 'Federal Way', 'Kent', 'Yakima', 'Renton', 'Spokane', 'Bellingham', 'Kennewick', 'Auburn', 'Pasco', 'Marysville', 'Lakewood', 'Redmond', 'Shoreline'],
      'WV': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown', 'Wheeling', 'Martinsburg', 'Fairmont', 'Beckley', 'Clarksburg', 'South Charleston', 'St. Albans', 'Vienna', 'Hurricane', 'Bridgeport', 'Keyser', 'Lewisburg', 'Buckhannon', 'Point Pleasant', 'Ripley', 'Elkins'],
      'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Oshkosh', 'Eau Claire', 'Janesville', 'West Allis', 'La Crosse', 'Sheboygan', 'Wauwatosa', 'Fond du Lac', 'Brookfield', 'New Berlin', 'Wausau', 'Beloit', 'Fitchburg'],
      'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Green River', 'Evanston', 'Riverton', 'Jackson', 'Cody', 'Rawlins', 'Lander', 'Torrington', 'Powell', 'Douglas', 'Worland', 'Buffalo', 'Wheatland', 'Kemmerer']
    };
    return citiesByState[state] || [];
  };
  const [profile, setProfile] = useState({
    displayName: '', // Salon name or business name
    email: '',
    bio: '',
    city: '',
    state: '',
    bookingInfo: {
      instagram: '',
      phone: '',
      email: '',
      bookingLink: ''
    },
    portfolio: [],
    profileImage: '',
    profileBackgroundColor: 'bg-pink-100', // Default to Soft Pink
    isActive: false
  });
  const [loading, setLoading] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // Pastel color options for profile backgrounds
  const pastelColors = [
    { name: 'White', value: 'bg-white', hex: '#ffffff' },
    { name: 'Soft Pink', value: 'bg-pink-100', hex: '#fce7f3' },
    { name: 'Lavender', value: 'bg-purple-100', hex: '#f3e8ff' },
    { name: 'Mint Green', value: 'bg-green-100', hex: '#dcfce7' },
    { name: 'Sky Blue', value: 'bg-blue-100', hex: '#dbeafe' },
    { name: 'Peach', value: 'bg-orange-100', hex: '#fed7aa' },
    { name: 'Lemon', value: 'bg-yellow-100', hex: '#fef3c7' },
    { name: 'Rose', value: 'bg-rose-100', hex: '#ffe4e6' },
    { name: 'Teal', value: 'bg-teal-100', hex: '#ccfbf1' },
    { name: 'Coral', value: 'bg-red-100', hex: '#fee2e2' },
    { name: 'Lilac', value: 'bg-violet-100', hex: '#ede9fe' }
  ];

  const checkExistingProfile = React.useCallback(async () => {
    try {
      const artistDoc = await getDoc(doc(db, 'artists', currentUser.uid));
      if (artistDoc.exists()) {
        const artistData = artistDoc.data();
        setProfile(artistData);
        setIsPublished(true);
        setIsEditing(true);
        setCurrentStep(5); // Go directly to review/edit step
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
      
      // Check if user already has a published artist profile
      checkExistingProfile();
    }
  }, [currentUser, checkExistingProfile]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Clear city when state changes
      if (field === 'state') {
        setProfile(prev => ({
          ...prev,
          city: ''
        }));
      }
    }
  };

  // Compress image function - more aggressive compression for smaller file sizes
  const compressImage = (file, maxWidth = 600, quality = 0.6) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress with more aggressive settings
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (file, type = 'portfolio') => {
    // Storage instance removed as we're using local base64 storage
    
    if (!file) {
      return;
    }
    
    // Validate portfolio limits
    if (type === 'portfolio' && profile.portfolio.length >= 15) {
      toast.error('Maximum 15 portfolio photos allowed');
      return;
    }
    
    // Set the appropriate loading state
    if (type === 'profile') {
      setUploadingProfileImage(true);
    } else {
      setUploadingPortfolio(true);
    }
    
    try {
      const compressedFile = await compressImage(file);
      
      // Convert compressed file to base64 for local storage (much smaller than original)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        
        if (type === 'profile') {
          setProfile(prev => ({ ...prev, profileImage: base64String }));
          toast.success('Profile photo compressed and saved');
          setUploadingProfileImage(false);
        } else {
          setProfile(prev => ({ ...prev, portfolio: [...prev.portfolio, base64String] }));
          toast.success(`Portfolio photo compressed and saved (${profile.portfolio.length + 1}/15)`);
          setUploadingPortfolio(false);
        }
      };
      reader.readAsDataURL(compressedFile);
      
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(`Failed to process image: ${error.message}`);
      if (type === 'profile') {
        setUploadingProfileImage(false);
      } else {
        setUploadingPortfolio(false);
      }
    }
    
  };

  const handleMultipleImageUpload = async (files, type = 'portfolio') => {
    if (!files || files.length === 0) {
      return;
    }
    
    // Validate portfolio limits
    if (type === 'portfolio' && profile.portfolio.length + files.length > 15) {
      toast.error(`Maximum 15 portfolio photos allowed. You can upload ${15 - profile.portfolio.length} more photos.`);
      return;
    }
    
    // Set the appropriate loading state
    if (type === 'profile') {
      setUploadingProfileImage(true);
    } else {
      setUploadingPortfolio(true);
    }
    
    try {
      
      // Compress all images and convert to base64
      const processPromises = Array.from(files).map(async (file, index) => {
        // Compress image
        const compressedFile = await compressImage(file);
        
        // Convert to base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64String = e.target.result;
            resolve(base64String);
          };
          reader.readAsDataURL(compressedFile);
        });
      });
      
      const base64Strings = await Promise.all(processPromises);
      
      if (type === 'profile') {
        setProfile(prev => ({ ...prev, profileImage: base64Strings[0] }));
        toast.success('Profile photo compressed and saved');
        setUploadingProfileImage(false);
      } else {
        setProfile(prev => ({ ...prev, portfolio: [...prev.portfolio, ...base64Strings] }));
        toast.success(`${base64Strings.length} portfolio photos compressed and saved (${profile.portfolio.length + base64Strings.length}/15)`);
        setUploadingPortfolio(false);
      }
    } catch (error) {
      console.error('Multiple processing error:', error);
      toast.error(`Failed to process images: ${error.message}`);
      if (type === 'profile') {
        setUploadingProfileImage(false);
      } else {
        setUploadingPortfolio(false);
      }
    }
    
  };

  const removePortfolioImage = (index) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    // Validate portfolio requirements
    if (profile.portfolio.length < 5) {
      toast.error('Please upload at least 5 portfolio photos to publish your profile');
      return;
    }
    
    if (profile.portfolio.length > 15) {
      toast.error('Please upload no more than 15 portfolio photos');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        ...profile,
        userId: currentUser.uid, // Add userId field for proper artist fetching
        isActive: true,
        updatedAt: new Date()
      };
      
      // If this is a new profile, add createdAt
      if (!isPublished) {
        profileData.createdAt = new Date();
      }
      
      
      // Save/update artist profile to artists collection
      await setDoc(doc(db, 'artists', currentUser.uid), profileData);
      
      // Update user profile to mark them as an artist (only if not already an artist)
      if (!isPublished) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          userType: 'artist',
          updatedAt: new Date()
        });
      }
      
      setIsPublished(true);
      
      if (isEditing) {
        toast.success('Profile updated successfully!');
      } else {
        toast.success('Profile published successfully! Redirecting to artists page...');
        
        // Redirect to artists page after successful publishing
        setTimeout(() => {
          navigate('/artists');
        }, 2000); // Give time for the success message to show
      }
      
    } catch (error) {
      console.error('Save error:', error);
      console.error('Error details:', error.message);
      toast.error(`Failed to save profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profile.displayName && profile.email && profile.profileBackgroundColor;
      case 2:
        return Object.values(profile.bookingInfo).some(value => value.trim() !== '');
      case 3:
        return profile.portfolio.length >= 3;
      case 4:
        return profile.city && profile.state;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Artist Profile
          </h1>
          <p className="text-gray-600">
            Step {currentStep} of 5: {getStepTitle(currentStep)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep ? 'bg-pink-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-pink-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <div className="flex gap-4">
              {isEditing && (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={loading || profile.portfolio.length < 5}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (isEditing ? 'Updating...' : 'Publishing...') : isEditing ? 'Update Profile' : 'Publish Profile'}
                <Save className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getStepTitle(step) {
    const titles = {
      1: 'Basic Information',
      2: 'Booking Information',
      3: 'Portfolio Upload',
      4: 'Location Setup',
      5: 'Review & Publish'
    };
    return titles[step];
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Basic Information</h2>
            <p className="text-gray-600">Let's start with your basic details.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business/Salon Name *
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                  placeholder="Enter your salon or business name"
                />
                <p className="text-xs text-gray-500 mt-1">This is how clients will see your business name</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                placeholder="Tell clients about yourself and your nail art style..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Background Color *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorDropdown(!showColorDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ${profile.profileBackgroundColor}`}
                    ></div>
                    <span>{pastelColors.find(c => c.value === profile.profileBackgroundColor)?.name || 'Soft Pink'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showColorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {pastelColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          handleInputChange('profileBackgroundColor', color.value);
                          setShowColorDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                      >
                        <div className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ${color.value}`}></div>
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Choose the background color for your profile card</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Booking Information</h2>
            <p className="text-gray-600">Share how clients can reach you for appointments.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Instagram className="w-4 h-4 inline mr-2" />
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={profile.bookingInfo.instagram}
                  onChange={(e) => handleInputChange('bookingInfo.instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                  placeholder="@yourhandle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.bookingInfo.phone}
                  onChange={(e) => handleInputChange('bookingInfo.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Booking Email
                </label>
                <input
                  type="email"
                  value={profile.bookingInfo.email}
                  onChange={(e) => handleInputChange('bookingInfo.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                  placeholder="booking@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Booking Link
                </label>
                <input
                  type="url"
                  value={profile.bookingInfo.bookingLink}
                  onChange={(e) => handleInputChange('bookingInfo.bookingLink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                  placeholder="https://calendly.com/yourname"
                />
              </div>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-lg">
              <p className="text-sm text-pink-800">
                <strong>Note:</strong> You need to provide at least one way for clients to contact you for bookings.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Portfolio Upload</h2>
            <p className="text-gray-600">Upload 5-15 photos showcasing your nail work across different styles.</p>
            
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-2 border-pink-200"
                    onError={(e) => {
                      console.error('Profile image failed to load:', profile.profileImage);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {}}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${
                      uploadingProfileImage 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-pink-600 hover:bg-pink-700'
                    } text-white`}
                  >
                    {uploadingProfileImage ? 'Uploading...' : (profile.profileImage ? 'Change Photo' : 'Upload Photo')}
                  </label>
                </div>
              </div>
            </div>
            
            {/* Portfolio Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Images ({profile.portfolio.length}/15) {profile.portfolio.length < 5 && <span className="text-red-600">- Minimum 5 required</span>}
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {profile.portfolio.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        console.error('Image failed to load:', image);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {}}
                    />
                    <button
                      onClick={() => removePortfolioImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {profile.portfolio.length < 15 && (
                  <div className={`border-2 border-dashed rounded-lg flex items-center justify-center h-48 ${
                    uploadingPortfolio 
                      ? 'border-pink-300 bg-pink-50' 
                      : 'border-gray-300 hover:border-pink-400'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleMultipleImageUpload(e.target.files, 'portfolio')}
                      className="hidden"
                      id="portfolio-upload"
                      disabled={uploadingPortfolio}
                    />
                    <label
                      htmlFor="portfolio-upload"
                      className={`cursor-pointer flex flex-col items-center transition-colors ${
                        uploadingPortfolio 
                          ? 'text-pink-600 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-pink-600'
                      }`}
                    >
                      {uploadingPortfolio ? (
                        <>
                          <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs mt-1">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-6 h-6" />
                          <span className="text-xs">Add Photos</span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
              
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-sm text-pink-800">
                  <strong>Requirements:</strong> Upload 5-15 portfolio photos. Include photos of different styles like French tips, nail art, ombre, gel extensions, etc. 
                  This helps clients understand your range and find the perfect match for their style.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Location Setup</h2>
            <p className="text-gray-600">Let clients know where you're located so they can find you nearby. We're currently only available in the US.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={profile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                >
                  <option value="">Select your state</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 focus:outline-none focus:ring-2"
                  disabled={!profile.state}
                >
                  <option value="">Select your city</option>
                  {getCitiesForState(profile.state).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {!profile.state && (
                  <p className="mt-1 text-sm text-gray-500">Please select a state first</p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit Your Profile' : 'Review & Publish'}
            </h2>
            <p className="text-gray-600">
              {isEditing ? 'Update your profile information and save changes.' : 'Review your profile information before going live.'}
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Basic Information</h3>
                <p><strong>Business/Salon Name:</strong> {profile.displayName}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Booking Information</h3>
                {profile.bookingInfo.instagram && <p><strong>Instagram:</strong> {profile.bookingInfo.instagram}</p>}
                {profile.bookingInfo.phone && <p><strong>Phone:</strong> {profile.bookingInfo.phone}</p>}
                {profile.bookingInfo.email && <p><strong>Email:</strong> {profile.bookingInfo.email}</p>}
                {profile.bookingInfo.bookingLink && <p><strong>Booking Link:</strong> {profile.bookingInfo.bookingLink}</p>}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Location</h3>
                <p><strong>City:</strong> {profile.city}</p>
                <p><strong>State:</strong> {profile.state}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Portfolio</h3>
                <p><strong>Profile Photo:</strong> {profile.profileImage ? '✓ Uploaded' : '✗ Not uploaded'}</p>
                <p><strong>Portfolio Images:</strong> {profile.portfolio.length}/15 photos uploaded {profile.portfolio.length < 5 && <span className="text-red-600">(Minimum 5 required)</span>}</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Ready to go live!</strong> Once you publish your profile, clients will be able to discover your work, 
                match with your style through AI recommendations, and contact you directly to book appointments.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
};

export default ArtistProfileSetup;
