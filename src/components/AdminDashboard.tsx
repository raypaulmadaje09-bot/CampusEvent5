import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  MessageSquare, 
  ShieldAlert, 
  Users, 
  Home, 
  Settings, 
  Lock, 
  FileText, 
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Edit3,
  ShieldCheck,
  Save,
  Database,
  Terminal,
  Image as ImageIcon,
  Send,
  X,
  Camera,
  Upload,
  Sun,
  Moon,
  Eye,
  EyeOff
} from 'lucide-react';
import { CampusEvent, EventCategory, FeedbackMessage, User, UserRole, AuditLog } from '../types';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  parseISO 
} from 'date-fns';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  events: CampusEvent[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (event: any) => void;
  onUpdateEvent: (event: CampusEvent) => void;
  onClose: () => void;
  onEdit: (event: CampusEvent) => void;
  homeConfig: any;
  setHomeConfig: (config: any) => void;
  categories: string[];
  onAddCategory: (cat: string) => void;
  messages: FeedbackMessage[];
  onReply: (messageId: string, text: string) => void;
  usersList: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onEditUser: (user: User) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  auditLogs: AuditLog[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  events, 
  onApprove, 
  onDelete, 
  onAdd,
  onUpdateEvent,
  onClose,
  onEdit,
  homeConfig,
  setHomeConfig,
  categories,
  onAddCategory,
  messages,
  onReply,
  usersList,
  onAddUser,
  onDeleteUser,
  onEditUser,
  theme,
  toggleTheme,
  auditLogs
}) => {
  const { user, logout, isMasterAdmin } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student' as UserRole
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newEventData, setNewEventData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    category: 'Social' as EventCategory,
    image: ''
  });

  const allCategories = ['All', ...categories];

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'OVERVIEW', visible: true },
    { id: 'manage', icon: ListTodo, label: 'MANAGE EVENTS', visible: true },
    { id: 'requests', icon: MessageSquare, label: 'USER REQUESTS', visible: true },
    { id: 'approval', icon: ShieldAlert, label: 'APPROVAL QUEUE', visible: true },
    { id: 'users', icon: Users, label: 'USER ACCOUNTS', visible: true },
    { id: 'home', icon: Home, label: 'HOME PAGE', visible: isMasterAdmin },
    { id: 'footer', icon: Settings, label: 'FOOTER SETTINGS', visible: isMasterAdmin },
    { id: 'profile', icon: Lock, label: 'PROFILE', visible: true },
    { id: 'audit', icon: FileText, label: 'AUDIT LOGS', visible: isMasterAdmin },
    { id: 'health', icon: Activity, label: 'SYSTEM HEALTH', visible: isMasterAdmin },
  ].filter(item => item.visible);

  const [activeTab, setActiveTab] = useState('overview');

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const filteredEvents = events.filter(e => 
      (selectedCategory === 'All' || e.category === selectedCategory)
    );

    const rows = [];
    let days = [];
    let day = startDate;

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = filteredEvents.filter(event => isSameDay(parseISO(event.date), cloneDay));
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[100px] border-r border-b p-2 transition-colors",
              theme === 'dark' ? "border-gray-800/50" : "border-gray-100",
              !isCurrentMonth ? (theme === 'dark' ? "text-gray-600 bg-gray-900/20" : "text-gray-300 bg-gray-50/50") : (theme === 'dark' ? "text-gray-300" : "text-gray-700"),
              isToday && (theme === 'dark' ? "bg-indigo-900/10" : "bg-indigo-50/50")
            )}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={cn(
                "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                isToday ? "bg-indigo-600 text-white" : ""
              )}>
                {format(day, 'd')}
              </span>
              {dayEvents.length > 0 && (
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              )}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => (
                <div 
                  key={event.id}
                  onClick={() => onEdit(event)}
                  className={cn(
                    "text-[9px] p-1 rounded border-l-2 truncate transition-colors cursor-pointer",
                    theme === 'dark' ? "bg-gray-800/80 border-indigo-500 hover:bg-gray-700" : "bg-indigo-50 border-indigo-600 hover:bg-indigo-100"
                  )}
                >
                  <span className="text-indigo-400 font-bold">{event.startTime.split(' ')[0]}</span> {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className={cn(
        "rounded-3xl overflow-hidden border transition-colors",
        theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
      )}>
        <div className="p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className={cn(
              "text-xl font-bold",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>{format(currentMonth, 'MMMM yyyy')}</h3>
            <p className="text-sm text-gray-500">{filteredEvents.length} events this month</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex border rounded-xl p-1",
              theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
            )}>
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 text-gray-400 hover:text-indigo-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date())}
                className={cn(
                  "px-4 py-1 text-xs font-bold rounded-lg mx-1",
                  theme === 'dark' ? "text-gray-300 hover:text-white bg-gray-800" : "text-gray-600 hover:text-indigo-600 bg-white shadow-sm"
                )}
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 text-gray-400 hover:text-indigo-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "grid grid-cols-7 border-t",
          theme === 'dark' ? "border-gray-800" : "border-gray-100"
        )}>
          {dayNames.map(d => (
            <div key={d} className={cn(
              "py-3 text-center text-[10px] font-bold tracking-widest border-r",
              theme === 'dark' ? "text-gray-500 border-gray-800" : "text-gray-400 border-gray-100"
            )}>
              {d}
            </div>
          ))}
        </div>
        <div className={cn(
          "border-t",
          theme === 'dark' ? "border-gray-800" : "border-gray-100"
        )}>
          {rows}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col font-sans transition-colors duration-300",
      theme === 'dark' ? "bg-[#090b14] text-gray-100" : "bg-gray-50 text-gray-900"
    )}>
      <header className={cn(
        "h-16 border-b px-6 flex items-center justify-between transition-colors",
        theme === 'dark' ? "bg-[#0f111a] border-gray-800/50" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <span className={cn(
            "text-lg font-bold tracking-tight",
            theme === 'dark' ? "text-white" : "text-gray-900"
          )}>Campus<span className="text-indigo-500">Events</span></span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-colors",
              theme === 'dark' ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
              isMasterAdmin ? "bg-red-600" : "bg-indigo-600"
            )}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "text-xs font-bold leading-none",
                theme === 'dark' ? "text-white" : "text-gray-900"
              )}>{user?.name}</span>
              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                {isMasterAdmin ? 'Master Authority' : 'Staff Node'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <button onClick={onClose} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              Dashboard
            </button>
            <button onClick={() => { logout(); onClose(); }} className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={cn(
          "w-64 border-r flex flex-col transition-colors",
          theme === 'dark' ? "bg-[#0f111a] border-gray-800/50" : "bg-white border-gray-200 shadow-sm"
        )}>
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white">C</div>
              <div>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-tighter leading-none",
                  theme === 'dark' ? "text-gray-100" : "text-gray-900"
                )}>Campus Admin</p>
                <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-0.5">Secured Instance</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all text-left",
                    activeTab === item.id 
                      ? (theme === 'dark' ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]" : "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm") 
                      : (theme === 'dark' ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800/30" : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50")
                  )}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", activeTab === item.id ? "text-indigo-400" : "text-gray-500")} />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6 pt-2">
            <div className={cn(
              "p-4 rounded-2xl border transition-colors",
              theme === 'dark' ? "bg-[#1a1c2e] border-indigo-500/10" : "bg-indigo-50 border-indigo-100"
            )}>
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">System Pulsar</p>
              <div className={cn(
                "h-1.5 w-full rounded-full overflow-hidden",
                theme === 'dark' ? "bg-gray-800" : "bg-indigo-100"
              )}>
                <div className="h-full bg-indigo-500 w-[85%]"></div>
              </div>
              <p className="text-[8px] text-gray-500 mt-2 font-bold">STABILITY: 99.8%</p>
            </div>
          </div>
        </aside>

        <main className={cn(
          "flex-1 overflow-y-auto p-8 lg:p-12 transition-colors",
          theme === 'dark' ? "bg-[#090b14]" : "bg-gray-50"
        )}>
          <div className="max-w-6xl">
            <div className="mb-10">
              <h1 className={cn(
                "text-4xl font-black tracking-tighter mb-2",
                theme === 'dark' ? "text-white" : "text-gray-900"
              )}>ADMIN OVERVIEW</h1>
              <p className="text-gray-500 font-medium italic text-sm">Monitoring system pulsars and security integrity.</p>
            </div>

            <div className="space-y-8">
              {activeTab === 'overview' && (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    {allCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-6 py-2 rounded-full text-[11px] font-bold transition-all border",
                          selectedCategory === cat
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40"
                            : (theme === 'dark' ? "bg-[#1a1c2e] text-gray-400 border-gray-800 hover:border-indigo-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] blur opacity-10"></div>
                    <div className="relative">
                      {renderCalendar()}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'manage' && (
                <div className="space-y-6">
                  {isAddingEvent ? (
                    <div className={cn(
                      "rounded-3xl border p-8 animate-in slide-in-from-bottom-4 duration-300",
                      theme === 'dark' ? "bg-[#121421] border-indigo-500/30" : "bg-white border-indigo-100 shadow-xl shadow-indigo-100/20"
                    )}>
                      <div className="flex justify-between items-center mb-8">
                        <h3 className={cn("text-xl font-bold flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                          <Plus className="w-5 h-5 text-indigo-500" /> New Campus Protocol
                        </h3>
                        <button onClick={() => setIsAddingEvent(false)} className="text-gray-500 hover:text-indigo-600"><X className="w-6 h-6" /></button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Event Title</label>
                            <input 
                              type="text" 
                              className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                                theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                              )}
                              value={newEventData.title}
                              onChange={e => setNewEventData({...newEventData, title: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Date</label>
                              <input 
                                type="date" 
                                className={cn(
                                  "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none",
                                  theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                )}
                                value={newEventData.date}
                                onChange={e => setNewEventData({...newEventData, date: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                                Category
                                <button 
                                  onClick={() => {
                                    const newCat = prompt('New Category Name:');
                                    if (newCat) onAddCategory(newCat);
                                  }}
                                  className="text-indigo-400 hover:text-indigo-300"
                                >
                                  + NEW
                                </button>
                              </label>
                              <select 
                                className={cn(
                                  "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none",
                                  theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                )}
                                value={newEventData.category}
                                onChange={e => setNewEventData({...newEventData, category: e.target.value as EventCategory})}
                              >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Start Time</label>
                              <input 
                                type="time" 
                                className={cn(
                                  "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none",
                                  theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                )}
                                value={newEventData.startTime}
                                onChange={e => setNewEventData({...newEventData, startTime: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">End Time</label>
                              <input 
                                type="time" 
                                className={cn(
                                  "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none",
                                  theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                )}
                                value={newEventData.endTime}
                                onChange={e => setNewEventData({...newEventData, endTime: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Location</label>
                            <input 
                              type="text" 
                              className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none",
                                theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                              )}
                              value={newEventData.location}
                              onChange={e => setNewEventData({...newEventData, location: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Visual Upload</label>
                            <div className={cn(
                              "h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-colors",
                              theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200 hover:border-indigo-300"
                            )}>
                              {newEventData.image ? (
                                <img src={newEventData.image} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                  <p className="text-[10px] font-bold text-gray-400">DRAG & DROP JPG/PNG</p>
                                </>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setNewEventData({...newEventData, image: reader.result as string});
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description</label>
                            <textarea 
                              className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm h-24 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-colors",
                                theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                              )}
                              value={newEventData.description}
                              onChange={e => setNewEventData({...newEventData, description: e.target.value})}
                            />
                          </div>
                          <button 
                            onClick={() => {
                              if (editingEventId) {
                                onUpdateEvent({
                                  ...newEventData,
                                  id: editingEventId,
                                  organizer: user?.name || 'Admin',
                                  attendees: 0,
                                  status: 'Approved'
                                });
                              } else {
                                onAdd({
                                  ...newEventData,
                                  organizer: user?.name || 'Admin',
                                  attendees: 0,
                                  id: Math.random().toString(36).substr(2, 9),
                                  status: 'Approved'
                                });
                              }
                              setIsAddingEvent(false);
                              setEditingEventId(null);
                              setNewEventData({ title: '', date: '', startTime: '', endTime: '', location: '', description: '', category: 'Social', image: '' });
                            }}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40"
                          >
                            {editingEventId ? 'Synchronize Protocol' : 'Execute Protocol'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "rounded-3xl border overflow-hidden transition-colors",
                      theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                    )}>
                      <div className={cn(
                        "p-6 border-b flex justify-between items-center",
                        theme === 'dark' ? "border-gray-800" : "border-gray-100"
                      )}>
                        <h3 className={cn(
                          "font-bold",
                          theme === 'dark' ? "text-white" : "text-gray-900"
                        )}>Manage Campus Events</h3>
                        <button 
                          onClick={() => setIsAddingEvent(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add Event
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className={cn(
                              "text-[10px] text-gray-500 uppercase tracking-widest",
                              theme === 'dark' ? "bg-gray-900/40" : "bg-gray-50"
                            )}>
                              <th className="px-6 py-4 font-black">Title</th>
                              <th className="px-6 py-4 font-black">Organizer</th>
                              <th className="px-6 py-4 font-black">Status</th>
                              <th className="px-6 py-4 font-black text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className={cn(
                            "divide-y",
                            theme === 'dark' ? "divide-gray-800/50" : "divide-gray-100"
                          )}>
                            {events.map(event => (
                              <tr key={event.id} className={cn(
                                "text-sm transition-colors",
                                theme === 'dark' ? "hover:bg-gray-800/20" : "hover:bg-gray-50"
                              )}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img src={event.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                    <span className={cn(
                                      "font-medium",
                                      theme === 'dark' ? "text-gray-100" : "text-gray-900"
                                    )}>{event.title}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400">{event.organizer}</td>
                                <td className="px-6 py-4">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase px-2 py-1 rounded",
                                    event.status === 'Approved' ? "bg-green-900/20 text-green-500" : "bg-amber-900/20 text-amber-500"
                                  )}>
                                    {event.status}
                                  </span>
                                </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 justify-end">
                                  {event.status === 'Pending' && (
                                    <button onClick={() => onApprove(event.id)} className="p-2 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600 hover:text-white transition-all" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setEditingEventId(event.id);
                                      setNewEventData({
                                        title: event.title,
                                        date: event.date.split('T')[0],
                                        startTime: event.startTime,
                                        endTime: event.endTime,
                                        location: event.location,
                                        description: event.description,
                                        category: event.category,
                                        image: event.image
                                      });
                                      setIsAddingEvent(true);
                                    }} 
                                    className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all" 
                                    title="Edit Node"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => onDelete(event.id)} className="p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={cn(
                    "lg:col-span-1 rounded-3xl border overflow-hidden transition-colors",
                    theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <div className={cn(
                      "p-6 border-b",
                      theme === 'dark' ? "border-gray-800" : "border-gray-100"
                    )}>
                      <h3 className={cn(
                        "font-bold text-sm uppercase tracking-widest",
                        theme === 'dark' ? "text-gray-100" : "text-gray-900"
                      )}>Feedback Pulsar</h3>
                    </div>
                    <div className={cn(
                      "divide-y",
                      theme === 'dark' ? "divide-gray-800/50" : "divide-gray-100"
                    )}>
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={cn(
                            "p-4 cursor-pointer hover:bg-white/5 transition-all border-l-4",
                            msg.status === 'new' ? "border-indigo-500 bg-indigo-500/5" : "border-transparent"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={cn(
                              "text-xs font-black",
                              theme === 'dark' ? "text-white" : "text-gray-900"
                            )}>{msg.senderName}</p>
                            <span className="text-[8px] text-gray-500 font-bold uppercase">{format(parseISO(msg.timestamp), 'HH:mm')}</span>
                          </div>
                          <p className="text-[10px] font-bold text-indigo-400 truncate mb-1">{msg.subject}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={cn(
                    "lg:col-span-2 rounded-3xl border flex flex-col min-h-[500px] transition-colors",
                    theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    {messages.length > 0 ? (
                      <>
                        <div className={cn(
                          "p-6 border-b flex items-center justify-between",
                          theme === 'dark' ? "border-gray-800" : "border-gray-100"
                        )}>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                                {messages[0].senderName.charAt(0)}
                              </div>
                              <div>
                                <p className={cn(
                                  "text-sm font-bold",
                                  theme === 'dark' ? "text-white" : "text-gray-900"
                                )}>{messages[0].senderName}</p>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{messages[0].senderEmail}</p>
                              </div>
                           </div>
                           <button className="p-2 text-gray-500 hover:text-indigo-600"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                          <div className="flex flex-col gap-1 max-w-[80%]">
                            <div className={cn(
                              "p-4 rounded-2xl rounded-tl-none text-xs shadow-sm",
                              theme === 'dark' ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
                            )}>
                              {messages[0].message}
                            </div>
                            <span className="text-[8px] text-gray-500 font-bold ml-1 uppercase">{format(parseISO(messages[0].timestamp), 'p')}</span>
                          </div>

                          {messages[0].replies.map((reply, i) => (
                            <div key={i} className={cn(
                              "flex flex-col gap-1 max-w-[80%]",
                              reply.sender === 'Admin' ? "self-end" : "self-start"
                            )}>
                              <div className={cn(
                                "p-4 rounded-2xl text-xs shadow-sm",
                                reply.sender === 'Admin' 
                                  ? "bg-indigo-600 text-white rounded-tr-none" 
                                  : (theme === 'dark' ? "bg-gray-800 text-gray-200 rounded-tl-none" : "bg-gray-100 text-gray-700 rounded-tl-none")
                              )}>
                                {reply.text}
                              </div>
                              <span className={cn(
                                "text-[8px] text-gray-500 font-bold uppercase",
                                reply.sender === 'Admin' ? "text-right mr-1" : "ml-1"
                              )}>
                                {reply.sender} • {format(parseISO(reply.timestamp), 'p')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className={cn(
                          "p-6 border-t",
                          theme === 'dark' ? "border-gray-800" : "border-gray-100"
                        )}>
                           <form 
                             onSubmit={(e) => {
                               e.preventDefault();
                               const input = (e.target as any).reply;
                               if (input.value) {
                                 onReply(messages[0].id, input.value);
                                 input.value = '';
                               }
                             }}
                             className="relative"
                           >
                              <input 
                                name="reply"
                                type="text" 
                                placeholder="Type your response..." 
                                className={cn(
                                  "w-full border rounded-2xl px-6 py-4 text-xs pr-16 focus:ring-1 focus:ring-indigo-500 outline-none",
                                  theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                )}
                              />
                              <button 
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                           </form>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-30">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">No active transmissions</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'approval' && (
                <div className={cn(
                  "rounded-3xl border overflow-hidden transition-colors",
                  theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                )}>
                  <div className={cn(
                    "p-6 border-b",
                    theme === 'dark' ? "border-gray-800" : "border-gray-100"
                  )}>
                    <h3 className={cn("font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Event Approval Protocol</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Authorized student submissions requiring clearance</p>
                  </div>
                  <div className="p-6">
                    {events.filter(e => e.status === 'Pending').length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                         {events.filter(e => e.status === 'Pending').map(e => (
                           <div key={e.id} className={cn(
                             "flex items-center justify-between p-4 rounded-2xl border transition-all",
                             theme === 'dark' ? "bg-gray-900/50 border-gray-800" : "bg-gray-50 border-gray-200"
                           )}>
                              <div className="flex items-center gap-4">
                                <img src={e.image} className="w-14 h-14 rounded-xl object-cover shadow-lg" />
                                <div>
                                  <p className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-gray-900")}>{e.title}</p>
                                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{e.category}</p>
                                  <p className="text-xs text-gray-500">{e.organizer} • {e.location}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <button onClick={() => onApprove(e.id)} className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-900/20">Authorize</button>
                                <button onClick={() => onDelete(e.id)} className={cn(
                                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                  theme === 'dark' ? "bg-red-600/20 text-red-500 hover:bg-red-600/30" : "bg-red-50 text-red-600 hover:bg-red-100"
                                )}>Revoke</button>
                              </div>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="py-24 text-center">
                        <ShieldAlert className="w-12 h-12 text-gray-400 opacity-20 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Queue Clear: All campus protocols synchronized</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  {isAddingUser && (
                    <div className={cn(
                      "p-8 rounded-3xl border animate-in slide-in-from-bottom-4 duration-300",
                      theme === 'dark' ? "bg-[#121421] border-indigo-500/30" : "bg-white border-indigo-100 shadow-xl shadow-indigo-100/10"
                    )}>
                      <div className="flex justify-between items-center mb-8">
                        <h3 className={cn("text-xl font-bold flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                          <Plus className="w-5 h-5 text-indigo-500" /> New Node Authorization
                        </h3>
                        <button onClick={() => setIsAddingUser(false)} className="text-gray-500 hover:text-indigo-600"><X className="w-6 h-6" /></button>
                      </div>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          onAddUser({
                            id: Math.random().toString(36).substr(2, 9),
                            ...newUserData,
                            avatar: `https://i.pravatar.cc/150?u=${newUserData.email}`
                          });
                          setIsAddingUser(false);
                          setNewUserData({ name: '', email: '', password: '', role: 'Student' });
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Legal Identity Name</label>
                            <input 
                              required
                              type="text" 
                              className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                                theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                              )}
                              value={newUserData.name}
                              onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Node (Login ID)</label>
                            <input 
                              required
                              type="email" 
                              className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                                theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                              )}
                              value={newUserData.email}
                              onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Access Key (Password)</label>
                            <input 
                              required
                              type="text" 
                              className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                                theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                              )}
                              value={newUserData.password}
                              onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Protocol Access Level</label>
                            <select 
                              className={cn(
                                "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                                theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                              )}
                              value={newUserData.role}
                              onChange={e => setNewUserData({...newUserData, role: e.target.value as UserRole})}
                              disabled={!isMasterAdmin}
                            >
                              <option value="Student">Student (Level 1)</option>
                              {isMasterAdmin && (
                                <>
                                  <option value="Admin">Staff Admin (Level 5)</option>
                                  <option value="MasterAdmin">Master Authority (Level 10)</option>
                                </>
                              )}
                            </select>
                            {!isMasterAdmin && <p className="mt-1 text-[8px] text-amber-500 font-bold uppercase italic">Staff Protocol: Restricted to Level 1</p>}
                          </div>
                          <button 
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40"
                          >
                            Execute Authorization
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className={cn(
                    "rounded-3xl border overflow-hidden transition-colors",
                    theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <div className={cn(
                      "p-6 border-b flex justify-between items-center",
                      theme === 'dark' ? "border-gray-800" : "border-gray-100"
                    )}>
                      <h3 className={cn(
                        "font-bold",
                        theme === 'dark' ? "text-white" : "text-gray-900"
                      )}>User Accounts Matrix</h3>
                      <button 
                        onClick={() => setIsAddingUser(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/40"
                      >
                        <Plus className="w-4 h-4" /> Authorize {isMasterAdmin ? 'Node' : 'Student'}
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {usersList
                          .filter(u => isMasterAdmin ? true : u.role === 'Student')
                          .map((u) => (
                          <div key={u.id} className={cn(
                            "flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all",
                            theme === 'dark' ? "bg-gray-900/30 border-gray-800/50 hover:border-gray-700" : "bg-gray-50 border-gray-200 hover:border-indigo-100"
                          )}>
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-indigo-400 transition-colors",
                                theme === 'dark' ? "bg-gray-800" : "bg-white border border-gray-100 shadow-sm"
                              )}>
                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                              </div>
                              <div>
                                <p className={cn(
                                  "font-black text-sm uppercase tracking-tight",
                                  theme === 'dark' ? "text-white" : "text-gray-900"
                                )}>{u.name}</p>
                                <p className="text-[11px] text-gray-500 font-medium">{u.email}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                              <div className="bg-[#0f111a]/50 px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-3">
                                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Passcode:</div>
                                 <span className="text-xs font-mono text-indigo-400">
                                   {showPasswords[u.id] ? u.password : '••••••••'}
                                 </span>
                                 <button 
                                   onClick={() => togglePasswordVisibility(u.id)}
                                   className="text-gray-600 hover:text-indigo-400 transition-colors"
                                 >
                                   {showPasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                 </button>
                              </div>

                              <div className="text-right min-w-[80px]">
                                <p className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block",
                                  u.role === 'MasterAdmin' ? "bg-red-600 text-white" : u.role === 'Admin' ? "bg-red-900/20 text-red-500" : "bg-indigo-900/20 text-indigo-500"
                                )}>{u.role}</p>
                                <div className="flex items-center gap-1.5 justify-end mt-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Authorized</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pl-4 border-l border-gray-800/50">
                                 <button 
                                   onClick={() => {
                                     const newName = prompt('New Name:', u.name);
                                     const newPass = prompt('New Password:', u.password);
                                     if (newName && newPass) {
                                       onEditUser({...u, name: newName, password: newPass});
                                     }
                                   }}
                                   className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                   title="Edit Node"
                                 >
                                   <Edit3 className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => {
                                     if (confirm(`DEAUTHORIZE NODE: Are you sure you want to delete ${u.name}?`)) {
                                       onDeleteUser(u.id);
                                     }
                                   }}
                                   className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                   title="Delete Node"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'home' && (
                <div className="space-y-8">
                  <div className={cn(
                    "rounded-3xl border p-8 transition-colors",
                    theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <h3 className={cn(
                      "text-xl font-bold mb-8 flex items-center gap-3",
                      theme === 'dark' ? "text-white" : "text-gray-900"
                    )}>
                      <Home className="w-6 h-6 text-indigo-500" /> 
                      Site Header & Identity
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Campus Name / Logo Text</label>
                          <input 
                            type="text" 
                            className={cn(
                              "w-full border rounded-2xl px-5 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                              theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                            )}
                            value={homeConfig.campusName} 
                            onChange={(e) => setHomeConfig({...homeConfig, campusName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Logo Visual Upload</label>
                          <div className={cn(
                            "h-20 border-2 border-dashed rounded-2xl flex items-center justify-center relative overflow-hidden group transition-colors",
                            theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200 hover:border-indigo-300"
                          )}>
                            {homeConfig.logoImage ? (
                              <img src={homeConfig.logoImage} alt="Logo Preview" className="h-10 w-auto object-contain" />
                            ) : (
                              <p className="text-[10px] font-bold text-gray-400">UPLOAD LOGO JPG/PNG</p>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setHomeConfig({...homeConfig, logoImage: reader.result as string});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Hero Background Picture</label>
                          <div className="flex flex-col gap-4">
                            <div className={cn(
                              "h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-colors",
                              theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200 hover:border-indigo-300"
                            )}>
                              <img src={homeConfig.heroImage} alt="Hero Preview" className="w-full h-full object-cover opacity-50" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-6 h-6 text-white mb-2" />
                                <span className="text-[10px] font-black uppercase text-white">Upload New Hero JPG</span>
                              </div>
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setHomeConfig({...homeConfig, heroImage: reader.result as string});
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Hero Main Headline</label>
                          <input 
                            type="text" 
                            className={cn(
                              "w-full border rounded-2xl px-5 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                              theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                            )}
                            value={homeConfig.heroHeadline} 
                            onChange={(e) => setHomeConfig({...homeConfig, heroHeadline: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Hero Description Text</label>
                          <textarea 
                            className={cn(
                              "w-full border rounded-2xl px-5 py-3 text-sm h-32 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-colors",
                              theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                            )}
                            value={homeConfig.heroSubheadline} 
                            onChange={(e) => setHomeConfig({...homeConfig, heroSubheadline: e.target.value})}
                          />
                        </div>
                        <button 
                          onClick={() => {
                            setHomeConfig({...homeConfig});
                            alert('PROTOCOL: Homepage CMS configuration finalized.');
                          }}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40 mt-4 flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Save Global Identity
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'footer' && (
                <div className={cn(
                  "rounded-3xl border p-8 transition-colors",
                  theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                )}>
                  <h3 className={cn(
                    "text-xl font-bold mb-8",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>Global Footer & Social Protocols</h3>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Footer Description</label>
                        <textarea 
                          className={cn(
                            "w-full border rounded-xl px-4 py-3 text-sm h-24 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-colors",
                            theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                          )}
                          value={homeConfig.footerText}
                          onChange={(e) => setHomeConfig({...homeConfig, footerText: e.target.value})}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Editable Social Protocol Links</label>
                        {['Twitter', 'Instagram', 'Github'].map(s => (
                          <div key={s} className={cn(
                            "flex items-center gap-4 p-2 rounded-xl border transition-colors",
                            theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
                          )}>
                            <span className="text-[9px] font-black text-gray-500 w-16 text-center">{s}</span>
                            <input type="text" className="flex-1 bg-transparent text-xs font-bold text-indigo-400 outline-none" defaultValue={`@campus_pulse_${s.toLowerCase()}`} />
                            <Edit3 className="w-3.5 h-3.5 text-gray-600 mr-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setHomeConfig({...homeConfig});
                        alert('PROTOCOL: Footer identity synchronized.');
                      }}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40"
                    >
                      Sync Footer protocols
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="max-w-3xl">
                  <div className={cn(
                    "rounded-3xl border p-8 transition-colors",
                    theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                  )}>
                    <h3 className={cn(
                      "text-xl font-bold mb-8 flex items-center gap-2",
                      theme === 'dark' ? "text-white" : "text-gray-900"
                    )}><Users className="w-5 h-5 text-indigo-500" /> Master Admin Profile</h3>
                    
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                      <div className="relative group">
                        <div className={cn(
                          "w-40 h-40 rounded-3xl overflow-hidden border-2 flex items-center justify-center shadow-2xl transition-colors",
                          theme === 'dark' ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50"
                        )}>
                          {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-16 h-16 text-gray-400" />
                          )}
                        </div>
                        <label className="absolute -bottom-3 -right-3 p-3 bg-indigo-600 text-white rounded-2xl cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40">
                          <Camera className="w-5 h-5" />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  onEditUser({...user!, avatar: reader.result as string});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex-1 space-y-6 w-full">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const target = e.target as any;
                          const updated = {
                            ...user!,
                            name: target.displayName.value
                          };
                          onEditUser(updated);
                          alert('PROTOCOL: Admin identity profile synchronized.');
                        }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Full Legal Identity</label>
                              <input 
                                name="displayName"
                                type="text" 
                                className={cn(
                                  "w-full border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors",
                                  theme === 'dark' ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                )}
                                defaultValue={user?.name} 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Registered Email</label>
                              <input 
                                type="text" 
                                className={cn(
                                  "w-full border rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed transition-colors",
                                  theme === 'dark' ? "bg-gray-800 border-gray-800 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"
                                )}
                                defaultValue={user?.email} 
                                disabled 
                              />
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Current System Status</label>
                            <div className={cn(
                              "p-4 border rounded-2xl flex items-center gap-4 transition-colors",
                              theme === 'dark' ? "bg-indigo-900/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"
                            )}>
                              <ShieldCheck className="w-6 h-6 text-indigo-400" />
                              <p className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                theme === 'dark' ? "text-white" : "text-indigo-600"
                              )}>Authorized Administrative Node • Online</p>
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" /> Finalize Profile protocol
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className={cn(
                  "rounded-3xl border overflow-hidden transition-colors",
                  theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                )}>
                  <div className={cn(
                    "p-6 border-b flex justify-between items-center",
                    theme === 'dark' ? "border-gray-800" : "border-gray-100"
                  )}>
                    <h3 className={cn("font-bold flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                      <Database className="w-5 h-5 text-indigo-400" /> Administrative History
                    </h3>
                    <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest">Archive Protocols</button>
                  </div>
                  <div className="p-6 font-mono text-[10px] leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar">
                    {auditLogs.map((l) => (
                      <div key={l.id} className="flex gap-4 mb-3 hover:bg-indigo-500/5 p-2 rounded transition-colors group border-b border-gray-800/20 last:border-0">
                        <span className="text-gray-600 whitespace-nowrap">[{format(parseISO(l.timestamp), 'HH:mm:ss')}]</span>
                        <span className={cn(
                          "font-black tracking-tighter w-14 text-center px-1 rounded",
                          l.type === 'CMS' ? 'bg-purple-900/20 text-purple-400' : 
                          l.type === 'EVNT' ? 'bg-green-900/20 text-green-500' : 
                          l.type === 'USER' ? 'bg-blue-900/20 text-blue-400' : 'bg-indigo-900/20 text-indigo-400'
                        )}>{l.type}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className="text-indigo-400 font-bold uppercase tracking-tight">{l.action}</p>
                            <span className="text-[8px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-black uppercase">By: {l.actor}</span>
                          </div>
                          <p className="text-gray-500 group-hover:text-gray-200 transition-colors">{l.details}</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-6 flex items-center gap-2 text-indigo-500 animate-pulse border-t border-gray-800 pt-4">
                       <Terminal className="w-3 h-3" />
                       <span className="font-black uppercase tracking-widest">Monitoring active node streams...</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'health' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={cn(
                    "rounded-3xl border p-6 transition-colors",
                    theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <h3 className={cn("font-bold mb-6", theme === 'dark' ? "text-white" : "text-gray-900")}>Server Load (Pulsar-01)</h3>
                    <div className="h-40 flex items-end gap-1 px-2">
                      {[40, 60, 45, 90, 65, 30, 80, 50, 40, 70, 85, 60, 45, 55, 75, 95, 40, 60, 45, 90].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-sm relative group">
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-1000" 
                            style={{ height: `${h}%` }}
                          ></div>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {h}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      <span>00:00</span>
                      <span>Now</span>
                    </div>
                  </div>

                  <div className={cn(
                    "rounded-3xl border p-6 transition-colors",
                    theme === 'dark' ? "bg-[#121421] border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <h3 className={cn("font-bold mb-6", theme === 'dark' ? "text-white" : "text-gray-900")}>Database Connectivity</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'Event Store', val: 98, color: 'bg-green-500' },
                        { label: 'User Auth Cluster', val: 100, color: 'bg-green-500' },
                        { label: 'Media CDN', val: 85, color: 'bg-indigo-500' },
                        { label: 'Map Engine', val: 92, color: 'bg-indigo-500' }
                      ].map((s, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                            <span className="text-gray-400">{s.label}</span>
                            <span className={theme === 'dark' ? "text-white" : "text-gray-900"}>{s.val}%</span>
                          </div>
                          <div className={cn(
                            "h-1.5 w-full rounded-full overflow-hidden",
                            theme === 'dark' ? "bg-gray-800" : "bg-gray-100"
                          )}>
                            <div className={cn("h-full rounded-full transition-all duration-1000", s.color)} style={{ width: `${s.val}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
