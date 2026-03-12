#include "task.h"
#include "FileManager.h"
#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <limits>  

using namespace std;

int getIntInput(const string& prompt) {
    int value;
    while (true) {
        cout << prompt;
        if (cin >> value) {
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return value;
        } else {
            cout << "Invalid input. Please enter a number." << endl;
            cin.clear(); 
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }
}

int main() {
    vector<Task> tasks = FileManager::loadTasks();

    cout << "Welcome to Study Planner!" << endl;

    bool running = true;

    while (running) {
        cout << "\nMenu:\n"
                "1. Add Task\n"
                "2. View Tasks\n"
                "3. Complete Task\n"
                "4. Delete Task\n"
                "5. Exit\n";

        int choice = getIntInput("Enter your choice: ");

        switch (choice) {
            case 1: { // Add Task
                string name, subject;
                int priority;

                cout << "Enter task name: ";
                getline(cin, name);

                cout << "Enter subject: ";
                getline(cin, subject);

                priority = getIntInput("Enter priority (1=High, 2=Medium, 3=Low): ");

                int year = getIntInput("Enter due year: ");
                int month = getIntInput("Enter due month (1-12): ");
                int day = getIntInput("Enter due day: ");
                int hour = getIntInput("Enter due hour (0-23): ");
                int minute = getIntInput("Enter due minute: ");

                tm dueDate = {};
                dueDate.tm_year = year - 1900;
                dueDate.tm_mon = month - 1;
                dueDate.tm_mday = day;
                dueDate.tm_hour = hour;
                dueDate.tm_min = minute;

                time_t deadline = mktime(&dueDate);

                Task newTask(name, subject, deadline, priority);
                tasks.push_back(newTask);
                FileManager::saveTasks(tasks);

                cout << "Task added successfully!" << endl;
                break;
            }

            case 2: { // View Tasks
                if (tasks.empty()) {
                    cout << "No tasks added yet!" << endl;
                } else {
                    cout << "\nAll Tasks:\n";
                    for (int i = 0; i < tasks.size(); i++) {
                        time_t now = time(0);
                        double secondsRemaining = difftime(tasks[i].getDeadline(), now);

                        int days = secondsRemaining / 86400;
                        int hours = (int(secondsRemaining) % 86400) / 3600;
                        int minutes = (int(secondsRemaining) % 3600) / 60;

                        string priorityText;
                        if (tasks[i].getPriority() == 1) priorityText = "High";
                        else if (tasks[i].getPriority() == 2) priorityText = "Medium";
                        else priorityText = "Low";

                        cout << i + 1 << ". " << tasks[i].getName()
                             << " | Subject: " << tasks[i].getSubject()
                             << " | Priority: " << priorityText
                             << " | Completed: " << (tasks[i].isCompleted() ? "Yes" : "No");

                        if (secondsRemaining <= 0) {
                            cout << " | Deadline Passed!";
                        } else {
                            cout << " | Due in: " << days << "d " << hours << "h " << minutes << "m";
                        }
                        cout << endl;
                    }
                }
                break;
            }

            case 3: {
                if (tasks.empty()) {
                    cout << "No tasks to complete!" << endl;
                } else {
                    int t = getIntInput("Enter task number to mark as complete: ");
                    if (t >= 1 && t <= tasks.size()) {
                        tasks[t - 1].markComplete();
                        FileManager::saveTasks(tasks);
                        cout << "Task marked as complete!" << endl;
                    } else {
                        cout << "Invalid task number!" << endl;
                    }
                }
                break;
            }

            case 4: {
                if (tasks.empty()) {
                    cout << "No tasks to delete!" << endl;
                } else {
                    cout << "\nCurrent Tasks:\n";
                    for (int i = 0; i < tasks.size(); i++)
                        cout << i + 1 << ". " << tasks[i].getName() << endl;

                    int t = getIntInput("Enter task number to delete: ");
                    if (t >= 1 && t <= tasks.size()) {
                        char confirm;
                        cout << "Are you sure you want to delete \"" << tasks[t-1].getName() << "\"? (y/n): ";
                        cin >> confirm;
                        cin.ignore(numeric_limits<streamsize>::max(), '\n');

                        if (confirm == 'y' || confirm == 'Y') {
                            tasks.erase(tasks.begin() + (t - 1));
                            FileManager::saveTasks(tasks);
                            cout << "Task deleted successfully!" << endl;
                        } else {
                            cout << "Deletion cancelled." << endl;
                        }
                    } else {
                        cout << "Invalid task number!" << endl;
                    }
                }
                break;
            }

            case 5: { // Exit
                FileManager::saveTasks(tasks);
                cout << "Tasks saved! Exiting. Goodbye!" << endl;
                running = false;
                break;
            }

            default:
                cout << "Invalid choice." << endl;
        }
    }

    return 0;
}