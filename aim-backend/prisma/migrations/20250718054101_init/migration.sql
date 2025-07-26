-- CreateEnum
CREATE TYPE "aim_schema"."OrderStatus" AS ENUM ('draft', 'pending', 'in_progress', 'in_review', 'completed', 'cancelled', 'on_hold');

-- CreateEnum
CREATE TYPE "aim_schema"."OrderPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "aim_schema"."OrderType" AS ENUM ('automation', 'integration', 'consultation', 'maintenance', 'custom');

-- CreateEnum
CREATE TYPE "aim_schema"."DocumentStatus" AS ENUM ('draft', 'finalized', 'sent', 'reviewed', 'approved', 'rejected', 'archived');

-- CreateEnum
CREATE TYPE "aim_schema"."CreatedAgentStatus" AS ENUM ('draft', 'in_development', 'testing', 'active', 'inactive', 'archived', 'error');

-- CreateEnum
CREATE TYPE "aim_schema"."AgentConnectionType" AS ENUM ('api', 'rpa', 'webscraping', 'file', 'database', 'iot_sensors');

-- CreateTable
CREATE TABLE "aim_schema"."user" (
    "id" VARCHAR(15) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "role_id" VARCHAR(15),
    "department" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "avatar_url" TEXT,
    "last_login_at" TIMESTAMPTZ(6),
    "is_first_login" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(15),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."key" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(15) NOT NULL,
    "hashed_password" VARCHAR(255),

    CONSTRAINT "key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."session" (
    "id" VARCHAR(127) NOT NULL,
    "user_id" VARCHAR(15) NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."roles" (
    "id" VARCHAR(15) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."user_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(15) NOT NULL,
    "bio" TEXT,
    "timezone" VARCHAR(50),
    "locale" VARCHAR(10) NOT NULL DEFAULT 'es',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "restrictions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."user_activity_log" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(15) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50),
    "details" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'low',
    "affected_resource_id" VARCHAR(50),
    "affected_resource_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."login_attempts" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "ip_address" INET,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "failure_reason" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(15) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."departments" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(15),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."clients" (
    "id" VARCHAR(30) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "rfc" VARCHAR(20),
    "industry" VARCHAR(100) NOT NULL,
    "company_size" VARCHAR(50),
    "website" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'prospecto',
    "reference_source" VARCHAR(100),
    "business_potential" VARCHAR(50),
    "notes" TEXT,
    "total_value" DECIMAL(15,2),
    "client_since" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(15),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."client_contacts" (
    "id" VARCHAR(30) NOT NULL,
    "client_id" VARCHAR(30) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "position" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "alternative_phone" VARCHAR(20),
    "department" VARCHAR(100),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."client_addresses" (
    "id" VARCHAR(30) NOT NULL,
    "client_id" VARCHAR(30) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "interior_number" VARCHAR(20),
    "neighborhood" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(10) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "country" VARCHAR(5) NOT NULL DEFAULT 'MX',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."agent_categories" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "color" VARCHAR(7),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."connection_types" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "advantages" JSONB NOT NULL,
    "useCases" JSONB NOT NULL,
    "examples" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."connection_templates" (
    "id" VARCHAR(30) NOT NULL,
    "connection_type_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "n8n_workflow" JSONB NOT NULL,
    "workflow_nodes" JSONB NOT NULL,
    "node_description" TEXT NOT NULL,
    "recommendation" TEXT,
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."agents" (
    "id" VARCHAR(30) NOT NULL,
    "category_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "short_description" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "icon" VARCHAR(50),
    "n8n_workflow" JSONB NOT NULL,
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    "complexity" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "estimated_time" VARCHAR(50),
    "requirements" JSONB,
    "tags" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."orders" (
    "id" VARCHAR(30) NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "client_id" VARCHAR(30) NOT NULL,
    "agent_id" VARCHAR(30),
    "created_by_id" VARCHAR(15) NOT NULL,
    "assigned_to_id" VARCHAR(15),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "internal_notes" TEXT,
    "status" "aim_schema"."OrderStatus" NOT NULL DEFAULT 'pending',
    "priority" "aim_schema"."OrderPriority" NOT NULL DEFAULT 'medium',
    "type" "aim_schema"."OrderType" NOT NULL DEFAULT 'automation',
    "requested_delivery_date" TIMESTAMPTZ(6),
    "start_date" TIMESTAMPTZ(6),
    "completed_date" TIMESTAMPTZ(6),
    "due_date" TIMESTAMPTZ(6),
    "estimated_budget" DECIMAL(15,2),
    "final_amount" DECIMAL(15,2),
    "currency" VARCHAR(5) NOT NULL DEFAULT 'MXN',
    "contact_name" VARCHAR(255),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(20),
    "contact_department" VARCHAR(100),
    "project_scope" TEXT,
    "deliverables" JSONB,
    "milestones" JSONB,
    "client_company_name" VARCHAR(255),
    "client_rfc" VARCHAR(20),
    "client_industry" VARCHAR(100),
    "client_size" VARCHAR(50),
    "client_website" VARCHAR(255),
    "project_street" VARCHAR(255),
    "project_interior_number" VARCHAR(20),
    "project_neighborhood" VARCHAR(100),
    "project_postal_code" VARCHAR(10),
    "project_city" VARCHAR(100),
    "project_state" VARCHAR(100),
    "project_country" VARCHAR(5) NOT NULL DEFAULT 'MX',
    "project_references" TEXT,
    "is_existing_client" BOOLEAN NOT NULL DEFAULT false,
    "reference_source" VARCHAR(100),
    "department_requesting" VARCHAR(100),
    "attachments" JSONB,
    "documents_data" JSONB,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "last_activity" TIMESTAMPTZ(6),
    "next_follow_up" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."order_items" (
    "id" VARCHAR(30) NOT NULL,
    "order_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(15,2),
    "total_price" DECIMAL(15,2),
    "agent_id" VARCHAR(30),
    "estimated_hours" INTEGER,
    "complexity" VARCHAR(20),
    "requirements" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."order_status_history" (
    "id" VARCHAR(30) NOT NULL,
    "order_id" VARCHAR(30) NOT NULL,
    "previous_status" "aim_schema"."OrderStatus",
    "new_status" "aim_schema"."OrderStatus" NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "changed_by_id" VARCHAR(15) NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."order_communications" (
    "id" VARCHAR(30) NOT NULL,
    "order_id" VARCHAR(30) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "subject" VARCHAR(255),
    "content" TEXT NOT NULL,
    "direction" VARCHAR(20) NOT NULL,
    "from_name" VARCHAR(255),
    "from_email" VARCHAR(255),
    "to_name" VARCHAR(255),
    "to_email" VARCHAR(255),
    "attachments" JSONB,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "requires_response" BOOLEAN NOT NULL DEFAULT false,
    "response_by_date" TIMESTAMPTZ(6),
    "created_by_id" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."document_types" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "phase" VARCHAR(20) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "estimatedTime" VARCHAR(50) NOT NULL,
    "form_schema" JSONB NOT NULL,
    "template_config" JSONB NOT NULL,
    "export_config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."documents" (
    "id" VARCHAR(30) NOT NULL,
    "document_number" VARCHAR(50) NOT NULL,
    "order_id" VARCHAR(30) NOT NULL,
    "document_type_id" VARCHAR(30) NOT NULL,
    "created_by_id" VARCHAR(15) NOT NULL,
    "last_modified_by_id" VARCHAR(15) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "aim_schema"."DocumentStatus" NOT NULL DEFAULT 'draft',
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0',
    "is_current_version" BOOLEAN NOT NULL DEFAULT true,
    "shared_data" JSONB NOT NULL,
    "specific_data" JSONB NOT NULL,
    "generated_files" JSONB,
    "metadata" JSONB,
    "approval_data" JSONB,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "email_sent_count" INTEGER NOT NULL DEFAULT 0,
    "finalized_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."document_versions" (
    "id" VARCHAR(30) NOT NULL,
    "document_id" VARCHAR(30) NOT NULL,
    "version" VARCHAR(10) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "shared_data" JSONB NOT NULL,
    "specific_data" JSONB NOT NULL,
    "generated_files" JSONB,
    "change_log" TEXT,
    "metadata" JSONB,
    "created_by_id" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."document_activities" (
    "id" VARCHAR(30) NOT NULL,
    "document_id" VARCHAR(30) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "activity_data" JSONB,
    "user_id" VARCHAR(15) NOT NULL,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."created_agents" (
    "id" VARCHAR(30) NOT NULL,
    "agent_number" VARCHAR(50) NOT NULL,
    "order_id" VARCHAR(30) NOT NULL,
    "template_agent_id" VARCHAR(30),
    "created_by_id" VARCHAR(15) NOT NULL,
    "assigned_to_id" VARCHAR(15),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "aim_schema"."CreatedAgentStatus" NOT NULL DEFAULT 'draft',
    "connectionType" "aim_schema"."AgentConnectionType" NOT NULL,
    "estimated_hours" INTEGER,
    "actual_hours" INTEGER,
    "complexity" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    "development_notes" TEXT,
    "testing_notes" TEXT,
    "deployment_notes" TEXT,
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "last_test_date" TIMESTAMPTZ(6),
    "deployed_at" TIMESTAMPTZ(6),
    "success_rate" REAL,
    "average_execution_time" INTEGER,
    "total_executions" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "created_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."agent_configurations" (
    "id" VARCHAR(30) NOT NULL,
    "created_agent_id" VARCHAR(30) NOT NULL,
    "config_name" VARCHAR(100) NOT NULL,
    "config_type" VARCHAR(50) NOT NULL,
    "config_data" JSONB NOT NULL,
    "connection_settings" JSONB,
    "authentication_data" JSONB,
    "scheduling_config" JSONB,
    "error_handling" JSONB,
    "notification_settings" JSONB,
    "selected_nodes" JSONB,
    "custom_nodes" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aim_schema"."agent_workflows" (
    "id" VARCHAR(30) NOT NULL,
    "created_agent_id" VARCHAR(30) NOT NULL,
    "workflow_name" VARCHAR(255) NOT NULL,
    "workflow_type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "n8n_workflow" JSONB NOT NULL,
    "workflow_nodes" JSONB NOT NULL,
    "node_count" INTEGER,
    "connection_count" INTEGER,
    "complexity" VARCHAR(20) DEFAULT 'medium',
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0.0',
    "is_current_version" BOOLEAN NOT NULL DEFAULT true,
    "parent_workflow_id" VARCHAR(30),
    "change_log" TEXT,
    "development_notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_tested" BOOLEAN NOT NULL DEFAULT false,
    "is_deployed" BOOLEAN NOT NULL DEFAULT false,
    "last_test_date" TIMESTAMPTZ(6),
    "test_results" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "aim_schema"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "aim_schema"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "aim_schema"."user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "aim_schema"."password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "aim_schema"."departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "aim_schema"."departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "clients_rfc_key" ON "aim_schema"."clients"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "agent_categories_name_key" ON "aim_schema"."agent_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_categories_slug_key" ON "aim_schema"."agent_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "connection_types_name_key" ON "aim_schema"."connection_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "connection_types_slug_key" ON "aim_schema"."connection_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "connection_templates_slug_key" ON "aim_schema"."connection_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "agents_slug_key" ON "aim_schema"."agents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "aim_schema"."orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "aim_schema"."orders"("status");

-- CreateIndex
CREATE INDEX "orders_priority_idx" ON "aim_schema"."orders"("priority");

-- CreateIndex
CREATE INDEX "orders_client_id_idx" ON "aim_schema"."orders"("client_id");

-- CreateIndex
CREATE INDEX "orders_created_by_id_idx" ON "aim_schema"."orders"("created_by_id");

-- CreateIndex
CREATE INDEX "orders_assigned_to_id_idx" ON "aim_schema"."orders"("assigned_to_id");

-- CreateIndex
CREATE INDEX "orders_requested_delivery_date_idx" ON "aim_schema"."orders"("requested_delivery_date");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "aim_schema"."orders"("created_at");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_idx" ON "aim_schema"."order_status_history"("order_id");

-- CreateIndex
CREATE INDEX "order_status_history_changed_at_idx" ON "aim_schema"."order_status_history"("changed_at");

-- CreateIndex
CREATE INDEX "order_communications_order_id_idx" ON "aim_schema"."order_communications"("order_id");

-- CreateIndex
CREATE INDEX "order_communications_created_at_idx" ON "aim_schema"."order_communications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_name_key" ON "aim_schema"."document_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_slug_key" ON "aim_schema"."document_types"("slug");

-- CreateIndex
CREATE INDEX "document_types_phase_idx" ON "aim_schema"."document_types"("phase");

-- CreateIndex
CREATE INDEX "document_types_is_active_idx" ON "aim_schema"."document_types"("is_active");

-- CreateIndex
CREATE INDEX "document_types_sort_order_idx" ON "aim_schema"."document_types"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_number_key" ON "aim_schema"."documents"("document_number");

-- CreateIndex
CREATE INDEX "documents_order_id_idx" ON "aim_schema"."documents"("order_id");

-- CreateIndex
CREATE INDEX "documents_document_type_id_idx" ON "aim_schema"."documents"("document_type_id");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "aim_schema"."documents"("status");

-- CreateIndex
CREATE INDEX "documents_created_by_id_idx" ON "aim_schema"."documents"("created_by_id");

-- CreateIndex
CREATE INDEX "documents_document_number_idx" ON "aim_schema"."documents"("document_number");

-- CreateIndex
CREATE INDEX "documents_created_at_idx" ON "aim_schema"."documents"("created_at");

-- CreateIndex
CREATE INDEX "documents_is_current_version_idx" ON "aim_schema"."documents"("is_current_version");

-- CreateIndex
CREATE INDEX "document_versions_document_id_idx" ON "aim_schema"."document_versions"("document_id");

-- CreateIndex
CREATE INDEX "document_versions_version_idx" ON "aim_schema"."document_versions"("version");

-- CreateIndex
CREATE INDEX "document_versions_created_at_idx" ON "aim_schema"."document_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_key" ON "aim_schema"."document_versions"("document_id", "version");

-- CreateIndex
CREATE INDEX "document_activities_document_id_idx" ON "aim_schema"."document_activities"("document_id");

-- CreateIndex
CREATE INDEX "document_activities_user_id_idx" ON "aim_schema"."document_activities"("user_id");

-- CreateIndex
CREATE INDEX "document_activities_action_idx" ON "aim_schema"."document_activities"("action");

-- CreateIndex
CREATE INDEX "document_activities_created_at_idx" ON "aim_schema"."document_activities"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "created_agents_agent_number_key" ON "aim_schema"."created_agents"("agent_number");

-- CreateIndex
CREATE INDEX "created_agents_order_id_idx" ON "aim_schema"."created_agents"("order_id");

-- CreateIndex
CREATE INDEX "created_agents_status_idx" ON "aim_schema"."created_agents"("status");

-- CreateIndex
CREATE INDEX "created_agents_created_by_id_idx" ON "aim_schema"."created_agents"("created_by_id");

-- CreateIndex
CREATE INDEX "created_agents_template_agent_id_idx" ON "aim_schema"."created_agents"("template_agent_id");

-- CreateIndex
CREATE INDEX "created_agents_connectionType_idx" ON "aim_schema"."created_agents"("connectionType");

-- CreateIndex
CREATE INDEX "created_agents_created_at_idx" ON "aim_schema"."created_agents"("created_at");

-- CreateIndex
CREATE INDEX "agent_configurations_created_agent_id_idx" ON "aim_schema"."agent_configurations"("created_agent_id");

-- CreateIndex
CREATE INDEX "agent_configurations_config_type_idx" ON "aim_schema"."agent_configurations"("config_type");

-- CreateIndex
CREATE INDEX "agent_configurations_is_active_idx" ON "aim_schema"."agent_configurations"("is_active");

-- CreateIndex
CREATE INDEX "agent_workflows_created_agent_id_idx" ON "aim_schema"."agent_workflows"("created_agent_id");

-- CreateIndex
CREATE INDEX "agent_workflows_workflow_type_idx" ON "aim_schema"."agent_workflows"("workflow_type");

-- CreateIndex
CREATE INDEX "agent_workflows_is_current_version_idx" ON "aim_schema"."agent_workflows"("is_current_version");

-- CreateIndex
CREATE INDEX "agent_workflows_is_active_idx" ON "aim_schema"."agent_workflows"("is_active");

-- CreateIndex
CREATE INDEX "agent_workflows_version_idx" ON "aim_schema"."agent_workflows"("version");

-- AddForeignKey
ALTER TABLE "aim_schema"."user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "aim_schema"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."user" ADD CONSTRAINT "user_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "aim_schema"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."key" ADD CONSTRAINT "key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aim_schema"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aim_schema"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aim_schema"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aim_schema"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."login_attempts" ADD CONSTRAINT "login_attempts_email_fkey" FOREIGN KEY ("email") REFERENCES "aim_schema"."user"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aim_schema"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."departments" ADD CONSTRAINT "departments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "aim_schema"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "aim_schema"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."client_contacts" ADD CONSTRAINT "client_contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "aim_schema"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."client_addresses" ADD CONSTRAINT "client_addresses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "aim_schema"."clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."connection_templates" ADD CONSTRAINT "connection_templates_connection_type_id_fkey" FOREIGN KEY ("connection_type_id") REFERENCES "aim_schema"."connection_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."agents" ADD CONSTRAINT "agents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "aim_schema"."agent_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "aim_schema"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."orders" ADD CONSTRAINT "orders_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "aim_schema"."agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."orders" ADD CONSTRAINT "orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."orders" ADD CONSTRAINT "orders_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "aim_schema"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "aim_schema"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."order_items" ADD CONSTRAINT "order_items_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "aim_schema"."agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "aim_schema"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."order_status_history" ADD CONSTRAINT "order_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."order_communications" ADD CONSTRAINT "order_communications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "aim_schema"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."order_communications" ADD CONSTRAINT "order_communications_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."documents" ADD CONSTRAINT "documents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "aim_schema"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."documents" ADD CONSTRAINT "documents_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "aim_schema"."document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."documents" ADD CONSTRAINT "documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."documents" ADD CONSTRAINT "documents_last_modified_by_id_fkey" FOREIGN KEY ("last_modified_by_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "aim_schema"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."document_versions" ADD CONSTRAINT "document_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."document_activities" ADD CONSTRAINT "document_activities_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "aim_schema"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."document_activities" ADD CONSTRAINT "document_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."created_agents" ADD CONSTRAINT "created_agents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "aim_schema"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."created_agents" ADD CONSTRAINT "created_agents_template_agent_id_fkey" FOREIGN KEY ("template_agent_id") REFERENCES "aim_schema"."agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."created_agents" ADD CONSTRAINT "created_agents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "aim_schema"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."created_agents" ADD CONSTRAINT "created_agents_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "aim_schema"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."agent_configurations" ADD CONSTRAINT "agent_configurations_created_agent_id_fkey" FOREIGN KEY ("created_agent_id") REFERENCES "aim_schema"."created_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."agent_workflows" ADD CONSTRAINT "agent_workflows_created_agent_id_fkey" FOREIGN KEY ("created_agent_id") REFERENCES "aim_schema"."created_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aim_schema"."agent_workflows" ADD CONSTRAINT "agent_workflows_parent_workflow_id_fkey" FOREIGN KEY ("parent_workflow_id") REFERENCES "aim_schema"."agent_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
