import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ArtistProfileSetup from '../components/ArtistProfileSetup';
import { User, Edit, X, Camera, MapPin, Instagram, Phone, Mail, Link as LinkIcon, Plus, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const ArtistDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [draftPortfolio, setDraftPortfolio] = useState([]);

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

  // Image compression function
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle multiple image upload
  const handleMultipleImageUpload = async (files, type = 'portfolio') => {
    if (!files || files.length === 0) return;
    
    const currentPortfolio = editingPortfolio ? draftPortfolio : profile.portfolio;
    
    if (type === 'portfolio' && currentPortfolio.length + files.length > 15) {
      toast.error('Maximum 15 portfolio photos allowed');
      return;
    }
    
    setUploadingPortfolio(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const compressedFile = await compressImage(file);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(compressedFile);
        });
      });
      
      const newImages = await Promise.all(uploadPromises);
      
      if (editingPortfolio) {
        // Add to draft portfolio
        setDraftPortfolio(prev => [...prev, ...newImages]);
        toast.success(`${newImages.length} photos added to draft`);
      } else {
        // Direct upload (non-edit mode)
        const updatedPortfolio = [...profile.portfolio, ...newImages];
        setProfile(prev => ({ ...prev, portfolio: updatedPortfolio }));
        
        // Update in Firestore
        await updateDoc(doc(db, 'artists', currentUser.uid), {
          portfolio: updatedPortfolio
        });
        
        toast.success(`${newImages.length} photos added to portfolio`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = (indexToDelete) => {
    if (!editingPortfolio) return;
    
    // Remove from draft portfolio
    const updatedDraft = draftPortfolio.filter((_, index) => index !== indexToDelete);
    setDraftPortfolio(updatedDraft);
    toast.success('Image removed from draft');
  };

  // Handle save portfolio changes
  const handleSavePortfolio = async () => {
    try {
      // Update profile with draft portfolio
      setProfile(prev => ({ ...prev, portfolio: draftPortfolio }));
      
      // Update in Firestore
      await updateDoc(doc(db, 'artists', currentUser.uid), {
        portfolio: draftPortfolio
      });
      
      // Exit edit mode
      setEditingPortfolio(false);
      setDraftPortfolio([]);
      
      toast.success('Portfolio updated successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save portfolio');
    }
  };

  // Handle cancel portfolio changes
  const handleCancelPortfolio = () => {
    // Reset draft portfolio and exit edit mode
    setDraftPortfolio([]);
    setEditingPortfolio(false);
    toast.success('Changes discarded');
  };

  // Initialize draft portfolio when entering edit mode
  React.useEffect(() => {
    if (editingPortfolio && draftPortfolio.length === 0 && profile && profile.portfolio) {
      setDraftPortfolio([...profile.portfolio]);
    }
  }, [editingPortfolio, profile, draftPortfolio.length]);

  // Redirect non-artists
  React.useEffect(() => {
    if (userProfile && userProfile.userType !== 'artist') {
      navigate('/');
    }
  }, [userProfile, navigate]);

  const fetchProfile = React.useCallback(async () => {
    try {
      const profileRef = doc(db, 'artists', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        setProfile(profileData);
        setEditedProfile(profileData);
        setShowSetup(false);
      } else {
        setShowSetup(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser, fetchProfile]);

  const handleSaveProfile = async () => {
    try {
      const profileRef = doc(db, 'artists', currentUser.uid);
      await updateDoc(profileRef, {
        ...editedProfile,
        updatedAt: new Date()
      });
      setProfile(editedProfile);
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setEditingProfile(false);
  };

  // States and cities data (same as in ArtistProfileSetup)
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return <ArtistProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
          <p className="text-gray-600">Manage your profile and portfolio</p>
        </div>

        {/* Profile Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Profile Overview</h2>
              {!editingProfile ? (
                <button 
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-gray-700 rounded-md hover:bg-pink-200 transition-colors"
                  >
                    Cancel
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Column 1 - Profile Picture */}
              <div className="md:col-span-3 flex flex-col items-center justify-center">
                <div className="relative">
                  {editedProfile?.profileImage ? (
                    <img
                      src={editedProfile.profileImage}
                      alt={editedProfile.displayName || 'Profile'}
                      className="w-48 h-48 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                  {editingProfile && (
                    <button className="absolute bottom-0 right-0 bg-pink-600 text-white rounded-full p-2 hover:bg-pink-700">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Column 2 - Display Name and Location */}
              <div className="md:col-span-3 space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={editedProfile.displayName || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, displayName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-2xl font-semibold text-gray-900">{profile?.displayName || 'Not set'}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {editingProfile ? (
                    <div className="space-y-3">
                      {/* State Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowStateDropdown(!showStateDropdown)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 flex items-center justify-between"
                        >
                          <span>{editedProfile.state || 'Select State'}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showStateDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {states.map((state) => (
                              <button
                                key={state}
                                onClick={() => {
                                  setEditedProfile({...editedProfile, state, city: ''});
                                  setShowStateDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                              >
                                {state}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* City Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCityDropdown(!showCityDropdown)}
                          disabled={!editedProfile.state}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <span>{editedProfile.city || (editedProfile.state ? 'Select City' : 'Select State First')}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showCityDropdown && editedProfile.state && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {getCitiesForState(editedProfile.state).map((city) => (
                              <button
                                key={city}
                                onClick={() => {
                                  setEditedProfile({...editedProfile, city});
                                  setShowCityDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-gray-600 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : 'Location not set'}
                    </p>
                  )}
                </div>

                {/* Profile Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Background Color</label>
                  {editingProfile ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorDropdown(!showColorDropdown)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ${editedProfile.profileBackgroundColor || 'bg-pink-100'}`}
                          ></div>
                          <span>{pastelColors.find(c => c.value === editedProfile.profileBackgroundColor)?.name || 'Soft Pink'}</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showColorDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {pastelColors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => {
                                setEditedProfile({...editedProfile, profileBackgroundColor: color.value});
                                setShowColorDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3"
                            >
                              <div className={`w-6 h-6 rounded-full border-2 border-white shadow-sm ${color.value}`}></div>
                              <span>{color.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-sm ${profile?.profileBackgroundColor || 'bg-pink-100'}`}
                      ></div>
                      <span className="text-lg text-gray-700">
                        {pastelColors.find(c => c.value === profile?.profileBackgroundColor)?.name || 'Soft Pink'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3 - Bio and Booking Info */}
              <div className="md:col-span-6 space-y-6">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {editingProfile ? (
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      rows="4"
                      placeholder="Tell clients about yourself..."
                    />
                  ) : (
                    <p className="text-lg text-gray-700 leading-relaxed">{profile?.bio || 'No bio added yet'}</p>
                  )}
                </div>

                {/* Booking Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Booking Information</label>
                  {editingProfile ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Instagram Handle</label>
                        <input
                          type="text"
                          value={editedProfile.bookingInfo?.instagram || ''}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            bookingInfo: {...editedProfile.bookingInfo, instagram: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Enter your Instagram username (e.g., @yourusername or yourusername)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Just your username - we'll add the @ symbol</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={editedProfile.bookingInfo?.phone || ''}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            bookingInfo: {...editedProfile.bookingInfo, phone: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Email</label>
                        <input
                          type="email"
                          value={editedProfile.bookingInfo?.email || ''}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            bookingInfo: {...editedProfile.bookingInfo, email: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="booking@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Booking Link</label>
                        <input
                          type="url"
                          value={editedProfile.bookingInfo?.bookingLink || ''}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile, 
                            bookingInfo: {...editedProfile.bookingInfo, bookingLink: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="https://calendly.com/yourname or https://yourbookinglink.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">Include the full URL (https://) so clients can click to book</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile?.bookingInfo?.instagram && (
                        <div className="flex items-center gap-3">
                          <Instagram className="w-5 h-5 text-pink-600" />
                          <span className="text-sm text-gray-600">Instagram:</span>
                          <a 
                            href={`https://instagram.com/${profile.bookingInfo.instagram.replace('@', '')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-pink-600 hover:text-pink-700 hover:underline"
                          >
                            @{profile.bookingInfo.instagram.replace('@', '')}
                          </a>
                        </div>
                      )}
                      {profile?.bookingInfo?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-pink-600" />
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="font-medium">{profile.bookingInfo.phone}</span>
                        </div>
                      )}
                      {profile?.bookingInfo?.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-pink-600" />
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="font-medium">{profile.bookingInfo.email}</span>
                        </div>
                      )}
                      {profile?.bookingInfo?.bookingLink && (
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-5 h-5 text-pink-600" />
                          <span className="text-sm text-gray-600">Booking:</span>
                          <a 
                            href={profile.bookingInfo.bookingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-pink-600 hover:text-pink-700 hover:underline"
                          >
                            Book Appointment
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        {profile?.portfolio && profile.portfolio.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Portfolio</h3>
                {!editingPortfolio && (
                  <button 
                    onClick={() => setEditingPortfolio(true)}
                    className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Portfolio
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(showAllPortfolio ? (editingPortfolio ? draftPortfolio : profile.portfolio) : (editingPortfolio ? draftPortfolio : profile.portfolio).slice(0, 6)).map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {editingPortfolio && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => handleDeleteImage(index)}
                          className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(editingPortfolio ? draftPortfolio : profile.portfolio).length > 6 && !showAllPortfolio && (
                  <button 
                    onClick={() => setShowAllPortfolio(true)}
                    className="aspect-square rounded-lg bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
                  >
                    <span className="text-pink-600 text-sm">+{(editingPortfolio ? draftPortfolio : profile.portfolio).length - 6} more</span>
                  </button>
                )}
                {showAllPortfolio && (
                  <button 
                    onClick={() => setShowAllPortfolio(false)}
                    className="aspect-square rounded-lg bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
                  >
                    <span className="text-pink-600 text-sm">Show Less</span>
                  </button>
                )}
                {editingPortfolio && draftPortfolio.length < 15 && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleMultipleImageUpload(e.target.files, 'portfolio')}
                      className="hidden"
                      id="portfolio-upload-edit"
                      disabled={uploadingPortfolio}
                    />
                    <label
                      htmlFor="portfolio-upload-edit"
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-colors cursor-pointer"
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                    </label>
                  </>
                )}
              </div>
              
              {/* Save/Cancel Buttons at Bottom */}
              {editingPortfolio && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleSavePortfolio}
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={handleCancelPortfolio}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDashboard;