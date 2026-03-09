#include "task.h"
#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <iomanip>

using namespace std;

class Task;
class Subject;
class StudyPlanner;

int main() {
    vector<Task> tasks;
    cout << "Welcome to Study Planner!" << endl;
    bool running = true;
    while (running) {
        cout << "\nMenu:\n1. Add Task\n2. View Tasks\n3. Complete Task\n4. Exit\n";
        int choice;
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1: {
                string name, subject;
                int priority;
                time_t deadline = time(0);
                cout << "Enter task name: ";
                cin.ignore();
                getline(cin, name);

                cout << "Enter subject: ";
                getline(cin, subject);

                cout << "Enter priority (1=High, 2=Medium, 3=Low): ";
                cin >> priority;

                Task newTask(name, subject, deadline, priority);
                tasks.push_back(newTask);

                cout << "Task added successfully!" << endl;
                break;
            }
            case 2: {
                if (tasks.empty()) {
                    cout << "No tasks added yet!" << endl;
                } else {
                    cout << "\nAll Tasks:\n";
                    for (int i = 0; i < tasks.size(); i++) {
                        cout << i+1 << ". " << tasks[i].getName() 
                            << " | Subject: " << tasks[i].getSubject()
                            << " | Priority: " << tasks[i].getPriority()
                            << " | Completed: " << (tasks[i].isCompleted() ? "Yes" : "No")
                            << endl;
                    }
                }
                break;
            }
            case 3: {
                if (tasks.empty()) {
                    cout << "No tasks to complete!" << endl;
                } else {
                    int t;
                    cout << "Enter task number to mark as complete: ";
                    cin >> t;
                    if (t >= 1 && t <= tasks.size()) {
                        tasks[t-1].markComplete();
                        cout << "Task marked as complete!" << endl;
                    } else {
                        cout << "Invalid task number!" << endl;
                    }
                }
                break;
            }
            case 4: cout << "Exiting. Goodbye!" << endl; running = false; break;
            default: cout << "Invalid choice." << endl;
        }
    }
    return 0;
}