# Automated IT Service Request Handler with AI-Assisted Triage

## 📌 Project Overview

**Automated IT Service Request Handler with AI-Assisted Triage** is a ServiceNow-based mini project designed to automate the lifecycle of IT incidents and service requests. The system uses **Flow Designer** for automated routing, an **AI-assisted/rule-based classifier** for request triage, **Automated Test Framework (ATF)** for validation, and **Reports & Dashboards** for operational insights.

The primary goal of the project is to reduce manual triage effort and ensure that incoming IT requests are automatically categorized, prioritized, and routed to the appropriate support team.

## 🚀 Key Features

### 1. Automated Incident Routing

A **Flow Designer** flow is configured to trigger when a new incident/request is created.

The flow:

* Reads the incoming request details
* Determines the request category and urgency
* Calculates/updates priority based on predefined conditions
* Routes the request to the appropriate assignment group
* Updates the incident automatically
* Triggers notifications when required

Example routing:

```text
Network Issue → Network Support
Hardware Issue → Hardware Support
Software Issue → Application Support
Access Issue → Service Desk
Unknown Issue → Service Desk (Fallback)
```

### 2. AI-Assisted Request Triage

A lightweight AI-assisted/rule-based classification component analyzes the incident description and identifies:

* **Category**
* **Urgency**
* **Priority**
* **Recommended Assignment Group**

For example:

```text
Input:
"VPN is not connecting and I cannot access company resources."

Classification:
Category: Network
Urgency: High
Assignment Group: Network Support
```

The project can be extended to use ServiceNow's available AI/GenAI capabilities for more advanced classification and recommendations.

### 3. Flow Designer Automation

The automation workflow follows this process:

```text
Incident Created
      ↓
Request Classification
      ↓
Category + Urgency Identified
      ↓
Priority Determined
      ↓
Assignment Group Selected
      ↓
Incident Updated
      ↓
Notification Triggered
      ↓
Incident Resolved
```

This demonstrates practical use of **ServiceNow Flow Designer**, conditions, actions, and automated record updates.

### 4. Automated Test Framework (ATF)

**ATF** is used to validate that the automation behaves as expected.

Test scenarios include:

* Network incident routing
* Hardware incident routing
* Software incident routing
* Access-related requests
* High-urgency requests
* Unknown/unclassified requests
* Assignment group validation
* Priority validation

Example:

```text
Test Input:
"Laptop screen is not working."

Expected Result:
Category = Hardware
Assignment Group = Hardware Support
```

This provides repeatable automated validation instead of relying only on manual testing.

### 5. Reports & Dashboard

A ServiceNow dashboard is created to provide visibility into IT request trends and support performance.

The dashboard includes reports such as:

* Total request/incident volume
* Requests by category
* Open vs. resolved incidents
* Average resolution time
* Priority distribution
* Assignment group workload

Example:

```text
IT Service Request Dashboard

Total Requests        : 500
Open Requests         : 120
Resolved Requests     : 380

Network               : 150
Hardware              : 120
Software              : 100
Access                : 80
Other                 : 50
```

### 6. CSA-Level ServiceNow Administration

The project also demonstrates fundamental **ServiceNow Certified System Administrator (CSA)** concepts.

#### Tables

The Incident table is used to manage the core incident lifecycle, including fields such as:

* Short Description
* Description
* Caller
* Category
* Urgency
* Impact
* Priority
* Assignment Group
* Assigned To
* State
* Resolution Notes

#### Roles

Role-based access is considered to ensure users receive only the permissions required for their responsibilities.

Example:

```text
End User
   → Create/View appropriate requests

Service Desk
   → View and update incidents

Administrator
   → Configure and manage the application
```

#### ACLs

**Access Control Lists (ACLs)** are used to demonstrate record- and field-level security.

For example, sensitive classification information can be restricted to authorized support/admin users.

## 🏗️ Project Architecture

```text
                ┌─────────────────────┐
                │      End User       │
                │ Creates IT Request  │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │ ServiceNow Incident │
                │       Table         │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │ AI-Assisted / Rule  │
                │    Classifier        │
                └──────────┬──────────┘
                           ↓
             ┌───────────────────────────┐
             │ Category + Urgency +      │
             │ Priority Determination    │
             └─────────────┬─────────────┘
                           ↓
                ┌─────────────────────┐
                │   Flow Designer     │
                │ Automated Routing   │
                └──────────┬──────────┘
                           ↓
              ┌────────────────────────┐
              │ Appropriate Assignment │
              │        Group           │
              └───────────┬────────────┘
                          ↓
                ┌─────────────────────┐
                │ Incident Resolution │
                └──────────┬──────────┘
                           ↓
             ┌─────────────────────────┐
             │ Reports & Dashboard     │
             └─────────────────────────┘

             ATF → Automated Validation
```

## 🛠️ Technologies & ServiceNow Features

* **ServiceNow**
* **Flow Designer**
* **Incident Management**
* **Automated Test Framework (ATF)**
* **Reports & Dashboards**
* **Roles & ACLs**
* **ServiceNow Tables**
* **Business Rules / Scripting** (where applicable)
* **AI-Assisted / Rule-Based Classification**

## 🎯 Project Objectives

* Automate manual incident triage and routing
* Improve request categorization
* Reduce incorrect assignment
* Demonstrate ServiceNow workflow automation
* Implement automated functional testing using ATF
* Provide operational visibility through dashboards
* Demonstrate practical CSA-level administration and security concepts

## 🔮 Future Enhancements

Possible future improvements include:

* Integration with ServiceNow GenAI capabilities
* AI-generated incident summaries
* Duplicate/similar incident detection
* Knowledge Article recommendations
* AI-generated resolution suggestions
* SLA breach prediction
* Automatic work-note generation
* Sentiment and impact analysis

## 📚 Learning Outcomes

Through this project, I gained hands-on experience with:

* ServiceNow Incident Management
* Flow Designer automation
* Automated request routing
* AI-assisted classification concepts
* ATF test case creation
* ServiceNow reporting and dashboards
* Tables and data structure
* Roles and access control
* ACL configuration
* CSA-level ServiceNow administration concepts

## 👨‍💻 Project Purpose

This project was developed as a practical demonstration of how **ServiceNow automation, AI-assisted triage, automated testing, security, and reporting** can be combined to build a more efficient IT service management workflow.
