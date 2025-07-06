import { Heart, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold">QuitWell</span>
            </div>
            <p className="text-gray-400">
              Empowering people to live smoke-free lives through personalized
              support and proven strategies.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-800 rounded-full p-2 hover:bg-gray-700 cursor-pointer">
                <Phone className="h-5 w-5" />
              </div>
              <div className="bg-gray-800 rounded-full p-2 hover:bg-gray-700 cursor-pointer">
                <Mail className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Programs</h3>
            <ul className="space-y-2 ">
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  Quit Plan
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  Group Support
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  One-on-One Coaching
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  Family Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 ">
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  Quit Tips
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  Health Benefits
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white! text-gray-400!">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                1-800-QUIT-NOW
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                support@quitwell.com
              </li>
              <li className="text-sm">24/7 Crisis Support Available</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 QuitWell. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm  mt-4 md:mt-0">
            <Link to="#" className="hover:text-white! text-gray-400!">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-white! text-gray-400!">
              Terms of Service
            </Link>
            <Link to="#" className="hover:text-white! text-gray-400!">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
